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
 *     Rationale: If we check at create time, two users can both create
 *     PENDING bookings for the same slot, and the system then has to
 *     reject one on approval. Checking at approval ensures only one
 *     APPROVED booking occupies any time slot.
 *
 *  2. ONLY APPROVED bookings block a slot.
 *     PENDING/REJECTED/CANCELLED bookings do not count as conflicts.
 *
 *  3. OVERLAP formula (Allen's interval algebra):
 *     Two intervals [A_start, A_end] and [B_start, B_end] overlap if:
 *       A_start < B_end  AND  A_end > B_start
 *
 *  4. ROLE ENFORCEMENT is done in the service layer so it is testable
 *     independent of the HTTP layer.
 * ================================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    // ─── Create ────────────────────────────────────────────────

    /**
     * Creates a PENDING booking after basic validation.
     * No conflict check yet — conflict runs at approval time.
     */
    @Override
    public BookingDTO.BookingResponse createBooking(String userId, BookingDTO.BookingRequest request) {
        log.info("Creating booking for userId={} resourceId={}", userId, request.getResourceId());

        // 1. Validate time window
        validateTimeWindow(request.getStartTime(), request.getEndTime());

        // 2. Validate attendee count
        if (request.getAttendeeCount() < 1) {
            throw new BookingException("Attendee count must be at least 1.", "VALIDATION_ERROR");
        }

        // 3. Verify both user and resource exist
        User user = findUserById(userId);
        Resource resource = findResourceById(request.getResourceId());

        // 4. Check that resource is available for booking
        if (!Boolean.TRUE.equals(resource.getIsAvailable())) {
            throw new BookingException(
                "Resource '" + resource.getName() + "' is currently not available for booking.",
                "RESOURCE_UNAVAILABLE"
            );
        }

        // 5. Build and persist booking
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

    // ─── Approve ───────────────────────────────────────────────

    /**
     * Approves a PENDING booking.
     *
     * Conflict detection runs HERE:
     *   Queries for any APPROVED booking on the same resource whose
     *   time window overlaps with the booking being approved.
     *
     * Transition: PENDING → APPROVED
     */
    @Override
    public BookingDTO.BookingResponse approveBooking(String bookingId, String adminNote, String adminRole) {
        assertAdmin(adminRole, "approve");

        Booking booking = findBookingById(bookingId);

        // Validate status transition
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw BookingException.invalidTransition(booking.getStatus().name(), "APPROVED");
        }

        // ── CONFLICT DETECTION ─────────────────────────────────
        // Check if any *other* APPROVED booking for the same resource
        // overlaps with this booking's time window.
        // We pass "NONE" as excludeId because approving is never self-editing.
        List<Booking> conflicts = bookingRepository.findOverlappingApprovedBookings(
                booking.getResourceId(),
                booking.getStartTime(),
                booking.getEndTime(),
                "NONE"   // Exclude nothing — we want all conflicts
        );

        if (!conflicts.isEmpty()) {
            // Get the first conflicting booking for a helpful message
            Booking conflict = conflicts.get(0);
            Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
            String resourceName = resource != null ? resource.getName() : booking.getResourceId();

            log.warn("Booking conflict detected for resourceId={} newStart={} newEnd={}",
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

        // Transition to APPROVED
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

    // ─── Reject ────────────────────────────────────────────────

    /**
     * Rejects a PENDING booking.
     * Transition: PENDING → REJECTED
     */
    @Override
    public BookingDTO.BookingResponse rejectBooking(String bookingId, String adminNote, String adminRole) {
        assertAdmin(adminRole, "reject");

        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw BookingException.invalidTransition(booking.getStatus().name(), "REJECTED");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminNote(adminNote);
        booking.setRejectedAt(LocalDateTime.now());
        booking.onUpdate();

        booking = bookingRepository.save(booking);
        log.info("Booking rejected: id={}", bookingId);

        User user = findUserById(booking.getUserId());
        Resource resource = findResourceById(booking.getResourceId());
        return buildResponse(booking, user, resource);
    }

    // ─── Cancel ────────────────────────────────────────────────

    /**
     * Cancels a booking.
     *
     * Authorization rules:
     *  - A USER can cancel their own PENDING or APPROVED booking.
     *  - An ADMIN can cancel any APPROVED booking.
     *
     * Transition: PENDING → CANCELLED  (own booking only)
     *             APPROVED → CANCELLED
     */
    @Override
    public BookingDTO.BookingResponse cancelBooking(String bookingId, String requestingUserId, String requestingRole) {
        Booking booking = findBookingById(bookingId);

        boolean isAdmin = "ADMIN".equalsIgnoreCase(requestingRole);
        boolean isOwner = booking.getUserId().equals(requestingUserId);

        if (!isAdmin && !isOwner) {
            throw BookingException.unauthorized("cancel");
        }

        // Only PENDING and APPROVED bookings can be cancelled
        if (booking.getStatus() == BookingStatus.REJECTED
                || booking.getStatus() == BookingStatus.CANCELLED
                || booking.getStatus() == BookingStatus.COMPLETED) {
            throw BookingException.invalidTransition(booking.getStatus().name(), "CANCELLED");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.onUpdate();

        booking = bookingRepository.save(booking);
        log.info("Booking cancelled: id={} by userId={}", bookingId, requestingUserId);

        User user = findUserById(booking.getUserId());
        Resource resource = findResourceById(booking.getResourceId());
        return buildResponse(booking, user, resource);
    }

    // ─── Read ──────────────────────────────────────────────────

    @Override
    public List<BookingDTO.BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingDTO.BookingResponse> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingDTO.BookingResponse getBookingById(String bookingId) {
        return buildResponse(findBookingById(bookingId));
    }

    // ─── Internal Helpers ──────────────────────────────────────

    private void validateTimeWindow(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new BookingException("Start time and end time are required.", "VALIDATION_ERROR");
        }
        if (!end.isAfter(start)) {
            throw new BookingException("End time must be after start time.", "VALIDATION_ERROR");
        }
        // Minimum booking duration: 15 minutes
        if (java.time.Duration.between(start, end).toMinutes() < 15) {
            throw new BookingException("Booking duration must be at least 15 minutes.", "VALIDATION_ERROR");
        }
    }

    private void assertAdmin(String role, String action) {
        if (!"ADMIN".equalsIgnoreCase(role)) {
            throw BookingException.unauthorized(action);
        }
    }

    private Booking findBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    private User findUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private Resource findResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    /** Build response when we already have User and Resource objects */
    private BookingDTO.BookingResponse buildResponse(Booking booking, User user, Resource resource) {
        return BookingDTO.BookingResponse.builder()
                .id(booking.getId())
                .status(booking.getStatus().name())
                .purpose(booking.getPurpose())
                .attendeeCount(booking.getAttendeeCount())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .adminNote(booking.getAdminNote())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .approvedAt(booking.getApprovedAt())
                .rejectedAt(booking.getRejectedAt())
                .cancelledAt(booking.getCancelledAt())
                .user(user != null
                        ? new BookingDTO.UserSummary(user.getId(), user.getName(), user.getEmail())
                        : null)
                .resource(resource != null
                        ? new BookingDTO.ResourceSummary(resource.getId(), resource.getName(), resource.getLocation(), resource.getType())
                        : null)
                .build();
    }

    /** Build response with lazy lookup from stored IDs (used by list methods) */
    private BookingDTO.BookingResponse buildResponse(Booking booking) {
        User user = userRepository.findById(booking.getUserId()).orElse(null);
        Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
        return buildResponse(booking, user, resource);
    }
}
