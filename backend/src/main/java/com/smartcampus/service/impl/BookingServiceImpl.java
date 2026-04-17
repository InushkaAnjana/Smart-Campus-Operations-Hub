package com.smartcampus.service.impl;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.exception.BookingException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ================================================================
 * BookingServiceImpl — Full Booking Management Implementation
 * ================================================================
 *
 * KEY DESIGN DECISIONS:
 *
 *  1. CONFLICT DETECTION happens at APPROVAL time, not at create time.
 *     Rationale: Multiple users can submit PENDING requests for the same
 *     slot simultaneously. Checking at create time would still leave a
 *     race window between two PENDING records. Checking at approval time
 *     ensures exactly one APPROVED booking occupies any time slot.
 *
 *  2. ONLY APPROVED bookings block a slot.
 *     PENDING / REJECTED / CANCELLED bookings do not count as conflicts.
 *     This allows a "first-come, first-served on approval" policy.
 *
 *  3. OVERLAP FORMULA (Allen's interval algebra):
 *     Two intervals [A_start, A_end] and [B_start, B_end] overlap iff:
 *       A_start < B_end  AND  A_end > B_start
 *     MongoDB query: startTime { $lt: newEnd }, endTime { $gt: newStart }
 *
 *  4. ROLE ENFORCEMENT is done in the service layer for testability —
 *     enforced independently of HTTP (so unit tests don't need MockMvc).
 *
 *  5. SOFT DELETE preserves audit trail:
 *     Status is set to DELETED and deletedAt is recorded.
 *     Physically deleted documents cannot be recovered or audited.
 *
 *  6. FILTERING is applied in the service layer using specific repository
 *     derived queries. When no filter is active, findAll() is used.
 *     DELETED bookings are always excluded from normal listings.
 * ================================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository    userRepository;
    private final ResourceRepository resourceRepository;

    // ════════════════════════════════════════════════════════════
    // CREATE
    // ════════════════════════════════════════════════════════════

    /**
     * Creates a PENDING booking after basic validation.
     * Conflict check intentionally deferred to approval time.
     *
     * Validations performed here:
     *   ✔ startTime < endTime (cross-field, must be done in service)
     *   ✔ booking duration ≥ 15 minutes
     *   ✔ attendeeCount ≥ 1 (also enforced by @Min on DTO)
     *   ✔ resource exists and is currently available
     */
    @Override
    public BookingDTO.BookingResponse createBooking(String userId, BookingDTO.BookingRequest request) {
        log.info("Creating booking for userId={} resourceId={}", userId, request.getResourceId());

        // ── VALIDATION ─────────────────────────────────────────

        // Cross-field time validation (cannot be done with a simple annotation)
        validateTimeWindow(request.getStartTime(), request.getEndTime());

        // attendeeCount guard (belt-and-suspenders; DTO @Min also enforces this)
        if (request.getAttendeeCount() == null || request.getAttendeeCount() < 1) {
            throw new BookingException("Attendee count must be at least 1.", "VALIDATION_ERROR");
        }

        // ── ENTITY EXISTENCE CHECKS ────────────────────────────

        User user = findUserById(userId);
        Resource resource = findResourceById(request.getResourceId());

        // Resource must be marked available by admin before it can be booked
        if (!Boolean.TRUE.equals(resource.getIsAvailable())) {
            throw new BookingException(
                "Resource '" + resource.getName() + "' is currently not available for booking.",
                "RESOURCE_UNAVAILABLE"
            );
        }

        // ── PERSIST ────────────────────────────────────────────

        Booking booking = Booking.builder()
                .userId(userId)
                .resourceId(resource.getId())
                .purpose(request.getPurpose())
                .attendeeCount(request.getAttendeeCount())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(BookingStatus.PENDING)
                .build();

        booking.onCreate();
        booking = bookingRepository.save(booking);

        log.info("Booking created: id={} status=PENDING", booking.getId());
        return buildResponse(booking, user, resource);
    }

    // ════════════════════════════════════════════════════════════
    // APPROVE
    // ════════════════════════════════════════════════════════════

    /**
     * Approves a PENDING booking (ADMIN only).
     *
     * WORKFLOW ENFORCEMENT:
     *   Only PENDING → APPROVED is valid.
     *   Any other current status → throw INVALID_STATUS_TRANSITION.
     *
     * CONFLICT DETECTION (runs HERE, not at create time):
     *   Queries for APPROVED bookings on the same resource whose
     *   time window overlaps with the booking being approved.
     *   Formula: existingStart < newEnd  AND  existingEnd > newStart
     *
     * Transition: PENDING → APPROVED
     */
    @Override
    public BookingDTO.BookingResponse approveBooking(String bookingId, String adminNote, String adminRole) {

        // ── ROLE CHECK ─────────────────────────────────────────
        assertAdmin(adminRole, "approve");

        Booking booking = findBookingById(bookingId);

        // ── WORKFLOW ENFORCEMENT ───────────────────────────────
        // Only a PENDING booking can be approved.
        // REJECTED / CANCELLED / COMPLETED / DELETED bookings are terminal.
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw BookingException.invalidTransition(booking.getStatus().name(), "APPROVED");
        }

        // ── CONFLICT DETECTION ─────────────────────────────────
        // Find any APPROVED booking for the same resource whose time window
        // overlaps with [booking.startTime, booking.endTime].
        //
        // Overlap condition:
        //   existingStart < booking.endTime   (existing starts before new ends)
        //   existingEnd   > booking.startTime (existing ends after new starts)
        //
        // We pass "NONE" as excludeId because this is not a self-edit scenario.
        List<Booking> conflicts = bookingRepository.findOverlappingApprovedBookings(
                booking.getResourceId(),
                booking.getStartTime(),
                booking.getEndTime(),
                "NONE"  // Do not exclude any specific booking — find ALL conflicts
        );

        if (!conflicts.isEmpty()) {
            // Build a helpful error message with the first conflicting slot details
            Booking conflict = conflicts.get(0);
            Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
            String resourceName = resource != null ? resource.getName() : booking.getResourceId();

            log.warn("Booking conflict detected: resourceId={} requestedStart={} requestedEnd={}",
                    booking.getResourceId(), booking.getStartTime(), booking.getEndTime());

            throw new BookingException(
                String.format(
                    "Cannot approve: Resource '%s' is already booked from %s to %s. " +
                    "Please choose a different time slot.",
                    resourceName,
                    conflict.getStartTime(),
                    conflict.getEndTime()
                ),
                "BOOKING_CONFLICT"
            );
        }
        // ── END CONFLICT DETECTION ─────────────────────────────

        // ── TRANSITION → APPROVED ──────────────────────────────
        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminNote(adminNote);
        booking.setApprovedAt(LocalDateTime.now());
        booking.onUpdate();

        booking = bookingRepository.save(booking);
        log.info("Booking approved: id={}", bookingId);

        User user = findUserById(booking.getUserId());
        Resource resource = findResourceById(booking.getResourceId());
        return buildResponse(booking, user, resource);
    }

    // ════════════════════════════════════════════════════════════
    // REJECT
    // ════════════════════════════════════════════════════════════

    /**
     * Rejects a PENDING booking (ADMIN only).
     *
     * WORKFLOW ENFORCEMENT:
     *   Only PENDING → REJECTED is valid.
     *
     * Both adminNote (general) and rejectionReason (user-facing) are stored
     * so the frontend can display them with different emphasis.
     *
     * Transition: PENDING → REJECTED
     */
    @Override
    public BookingDTO.BookingResponse rejectBooking(String bookingId, String adminNote, String adminRole) {

        // ── ROLE CHECK ─────────────────────────────────────────
        assertAdmin(adminRole, "reject");

        Booking booking = findBookingById(bookingId);

        // ── WORKFLOW ENFORCEMENT ───────────────────────────────
        // Only PENDING bookings can be rejected.
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw BookingException.invalidTransition(booking.getStatus().name(), "REJECTED");
        }

        // ── TRANSITION → REJECTED ──────────────────────────────
        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminNote(adminNote);
        booking.setRejectionReason(adminNote); // Stored separately for clean UI rendering
        booking.setRejectedAt(LocalDateTime.now());
        booking.onUpdate();

        booking = bookingRepository.save(booking);
        log.info("Booking rejected: id={} reason={}", bookingId, adminNote);

        User user = findUserById(booking.getUserId());
        Resource resource = findResourceById(booking.getResourceId());
        return buildResponse(booking, user, resource);
    }

    // ════════════════════════════════════════════════════════════
    // CANCEL
    // ════════════════════════════════════════════════════════════

    /**
     * Cancels a booking.
     *
     * AUTHORIZATION RULES:
     *  - A regular USER can cancel their own PENDING or APPROVED booking.
     *  - An ADMIN can cancel any booking in any non-terminal state.
     *
     * WORKFLOW ENFORCEMENT:
     *  Cannot cancel REJECTED, COMPLETED, or DELETED bookings — they are terminal.
     *
     * Transitions:
     *   PENDING  → CANCELLED  (user withdraws their own request)
     *   APPROVED → CANCELLED  (user or admin cancels a confirmed booking)
     */
    @Override
    public BookingDTO.BookingResponse cancelBooking(
            String bookingId, String requestingUserId, String requestingRole) {

        Booking booking = findBookingById(bookingId);

        boolean isAdmin = "ADMIN".equalsIgnoreCase(requestingRole);
        boolean isOwner = booking.getUserId().equals(requestingUserId);

        // ── AUTHORIZATION ──────────────────────────────────────
        // Must be either the owner or an admin
        if (!isAdmin && !isOwner) {
            throw BookingException.unauthorized("cancel");
        }

        // ── WORKFLOW ENFORCEMENT ───────────────────────────────
        // Terminal states cannot transition to CANCELLED
        if (booking.getStatus() == BookingStatus.REJECTED
                || booking.getStatus() == BookingStatus.CANCELLED
                || booking.getStatus() == BookingStatus.COMPLETED
                || booking.getStatus() == BookingStatus.DELETED) {
            throw BookingException.invalidTransition(booking.getStatus().name(), "CANCELLED");
        }

        // ── TRANSITION → CANCELLED ─────────────────────────────
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.onUpdate();

        booking = bookingRepository.save(booking);
        log.info("Booking cancelled: id={} by userId={}", bookingId, requestingUserId);

        User user = findUserById(booking.getUserId());
        Resource resource = findResourceById(booking.getResourceId());
        return buildResponse(booking, user, resource);
    }

    // ════════════════════════════════════════════════════════════
    // DELETE (SOFT DELETE)
    // ════════════════════════════════════════════════════════════

    /**
     * Soft-deletes a booking (ADMIN only).
     *
     * WHY SOFT DELETE OVER HARD DELETE?
     *  - Preserves full audit history (who booked, when deleted, by whom)
     *  - Enables recovery if deleted accidentally
     *  - Does not break historical reports or analytics
     *  - Hard deletes are irreversible and violate audit compliance needs
     *
     * IMPLEMENTATION:
     *  Instead of calling bookingRepository.delete(), we set:
     *    status    = DELETED
     *    deletedAt = now()
     *  The document remains in MongoDB but is filtered out of all
     *  normal listing queries (service excludes DELETED status by default).
     *
     * Transition: Any status → DELETED
     */
    @Override
    public BookingDTO.BookingResponse deleteBooking(String bookingId, String requestingRole) {

        // ── ROLE CHECK ─────────────────────────────────────────
        // Only admins may delete bookings to protect user data
        assertAdmin(requestingRole, "delete");

        Booking booking = findBookingById(bookingId);

        // Already deleted? Idempotent — return current state without error
        if (booking.getStatus() == BookingStatus.DELETED) {
            log.info("Booking id={} is already soft-deleted; returning current state", bookingId);
            User user = findUserById(booking.getUserId());
            Resource resource = findResourceById(booking.getResourceId());
            return buildResponse(booking, user, resource);
        }

        // ── SOFT DELETE ────────────────────────────────────────
        booking.setStatus(BookingStatus.DELETED);
        booking.setDeletedAt(LocalDateTime.now());
        booking.onUpdate();

        booking = bookingRepository.save(booking);
        log.info("Booking soft-deleted: id={} by role={}", bookingId, requestingRole);

        User user = findUserById(booking.getUserId());
        Resource resource = findResourceById(booking.getResourceId());
        return buildResponse(booking, user, resource);
    }

    // ════════════════════════════════════════════════════════════
    // READ — GET ALL (ADMIN with FILTERING)
    // ════════════════════════════════════════════════════════════

    /**
     * Returns all bookings with optional filtering.
     * Called by GET /api/bookings (ADMIN only).
     *
     * FILTERING LOGIC:
     *  The service inspects which filter params are non-null and calls the
     *  appropriate repository derived query. DELETED bookings are always
     *  excluded from the result (visible only via direct ID lookup).
     *
     *  Filter priority (checked in order):
     *   1. date + other combos  (startTime range generated from LocalDate)
     *   2. status + resourceId  (combined filter)
     *   3. status only
     *   4. resourceId only
     *   5. userId only
     *   6. no filter → all non-deleted bookings
     *
     *  If 'date' is present, it is converted to a [startOfDay, endOfDay]
     *  LocalDateTime range and used in a findByStartTimeBetween query.
     */
    @Override
    public List<BookingDTO.BookingResponse> getAllBookings(BookingDTO.BookingFilter filter) {

        List<Booking> bookings;

        boolean hasStatus     = filter != null && filter.getStatus() != null && !filter.getStatus().isBlank();
        boolean hasResourceId = filter != null && filter.getResourceId() != null && !filter.getResourceId().isBlank();
        boolean hasUserId     = filter != null && filter.getUserId() != null && !filter.getUserId().isBlank();
        boolean hasDate       = filter != null && filter.getDate() != null;

        if (hasDate) {
            // Convert LocalDate → start-of-day / end-of-day range
            LocalDate date = filter.getDate();
            LocalDateTime from = date.atStartOfDay();           // 2026-04-10T00:00
            LocalDateTime to   = date.plusDays(1).atStartOfDay(); // 2026-04-11T00:00 (exclusive)

            if (hasStatus && hasResourceId) {
                // Both status and resourceId + date — use in-memory combination
                BookingStatus statusEnum = parseStatus(filter.getStatus());
                bookings = bookingRepository.findByResourceIdAndStartTimeBetween(filter.getResourceId(), from, to)
                        .stream()
                        .filter(b -> b.getStatus() == statusEnum)
                        .collect(Collectors.toList());

            } else if (hasStatus) {
                // Status + date
                BookingStatus statusEnum = parseStatus(filter.getStatus());
                bookings = bookingRepository.findByStatusAndStartTimeBetween(statusEnum, from, to);

            } else if (hasResourceId) {
                // Resource + date
                bookings = bookingRepository.findByResourceIdAndStartTimeBetween(filter.getResourceId(), from, to);

            } else if (hasUserId) {
                // User + date
                bookings = bookingRepository.findByUserIdAndStartTimeBetween(filter.getUserId(), from, to);

            } else {
                // Date only
                bookings = bookingRepository.findByStartTimeBetween(from, to);
            }

        } else if (hasStatus && hasResourceId) {
            // Status + resource (no date)
            BookingStatus statusEnum = parseStatus(filter.getStatus());
            bookings = bookingRepository.findByResourceIdAndStatus(filter.getResourceId(), statusEnum);

        } else if (hasStatus) {
            // Status only
            BookingStatus statusEnum = parseStatus(filter.getStatus());
            bookings = bookingRepository.findByStatus(statusEnum);

        } else if (hasResourceId) {
            // Resource only
            bookings = bookingRepository.findByResourceId(filter.getResourceId());

        } else if (hasUserId) {
            // User only
            bookings = bookingRepository.findByUserId(filter.getUserId());

        } else {
            // No filter — return everything
            bookings = bookingRepository.findAll();
        }

        // Always exclude soft-deleted bookings from normal admin listings
        return bookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.DELETED)
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    // ════════════════════════════════════════════════════════════
    // READ — USER'S OWN BOOKINGS
    // ════════════════════════════════════════════════════════════

    /**
     * Returns all bookings belonging to the authenticated user.
     * Soft-deleted bookings are excluded (users should not see deleted items).
     */
    @Override
    public List<BookingDTO.BookingResponse> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .filter(b -> b.getStatus() != BookingStatus.DELETED) // Exclude soft-deleted
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    // ════════════════════════════════════════════════════════════
    // READ — SINGLE BOOKING BY ID
    // ════════════════════════════════════════════════════════════

    /** Get a single booking by ID. Throws 404 if not found. */
    @Override
    public BookingDTO.BookingResponse getBookingById(String bookingId) {
        return buildResponse(findBookingById(bookingId));
    }

    // ════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ════════════════════════════════════════════════════════════

    /**
     * Validates the booking time window:
     *  ✔ Neither start nor end may be null (belt-and-suspenders; DTO @NotNull too)
     *  ✔ endTime must be strictly after startTime  (startTime < endTime)
     *  ✔ Minimum booking duration: 15 minutes
     */
    private void validateTimeWindow(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new BookingException("Start time and end time are required.", "VALIDATION_ERROR");
        }
        // Core rule: startTime must be before endTime
        if (!end.isAfter(start)) {
            throw new BookingException(
                "End time must be strictly after start time. " +
                "Received: start=" + start + ", end=" + end,
                "VALIDATION_ERROR"
            );
        }
        // Minimum duration enforcement
        if (java.time.Duration.between(start, end).toMinutes() < 15) {
            throw new BookingException(
                "Booking duration must be at least 15 minutes.",
                "VALIDATION_ERROR"
            );
        }
    }

    /**
     * Throws a BookingException (mapped to HTTP 403) if the caller is not ADMIN.
     * Role check is centralised here so every action uses the same logic.
     */
    private void assertAdmin(String role, String action) {
        if (!"ADMIN".equalsIgnoreCase(role)) {
            throw BookingException.unauthorized(action);
        }
    }

    /**
     * Parses a status string to BookingStatus enum.
     * Throws BookingException with VALIDATION_ERROR if invalid value provided.
     */
    private BookingStatus parseStatus(String statusStr) {
        try {
            return BookingStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BookingException(
                "Invalid status filter value: '" + statusStr + "'. " +
                "Valid values are: PENDING, APPROVED, REJECTED, CANCELLED, COMPLETED.",
                "VALIDATION_ERROR"
            );
        }
    }

    /** Lookup booking by ID — throws 404 if not found */
    private Booking findBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    /** Lookup user by ID — throws 404 if not found */
    private User findUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    /** Lookup resource by ID — throws 404 if not found */
    private Resource findResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    /**
     * Builds the full BookingResponse DTO when User and Resource are already loaded.
     * Avoids redundant DB lookups in methods that already fetched these entities.
     */
    private BookingDTO.BookingResponse buildResponse(Booking booking, User user, Resource resource) {
        return BookingDTO.BookingResponse.builder()
                .id(booking.getId())
                .status(booking.getStatus().name())
                .purpose(booking.getPurpose())
                .attendeeCount(booking.getAttendeeCount() != null ? booking.getAttendeeCount() : 0)
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .adminNote(booking.getAdminNote())
                .rejectionReason(booking.getRejectionReason())  // Shown prominently on REJECTED
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .approvedAt(booking.getApprovedAt())
                .rejectedAt(booking.getRejectedAt())
                .cancelledAt(booking.getCancelledAt())
                .deletedAt(booking.getDeletedAt())              // Populated on DELETED bookings
                .user(user != null
                        ? new BookingDTO.UserSummary(user.getId(), user.getName(), user.getEmail())
                        : null)
                .resource(resource != null
                        ? new BookingDTO.ResourceSummary(
                                resource.getId(),
                                resource.getName(),
                                resource.getLocation(),
                                resource.getType() != null ? resource.getType().name() : null)
                        : null)
                .build();
    }

    /**
     * Overload for list operations — performs lazy ID lookups from the stored
     * userId/resourceId on the Booking document. Slightly less efficient than
     * the above overload but necessary when we don't have the entities pre-loaded.
     */
    private BookingDTO.BookingResponse buildResponse(Booking booking) {
        User user = userRepository.findById(booking.getUserId()).orElse(null);
        Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
        return buildResponse(booking, user, resource);
    }
}
