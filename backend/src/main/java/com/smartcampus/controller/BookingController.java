package com.smartcampus.controller;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * ================================================================
 * BookingController — Booking Management REST Endpoints
 * ================================================================
 * Base URL: /api/bookings
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Endpoint │ Who Can Call │
 * ├─────────────────────────────────────────────────────────────┤
 * │ POST /api/bookings │ Any auth user │
 * │ GET /api/bookings │ ADMIN only │
 * │ GET /api/bookings?status=X │ ADMIN only (filter) │
 * │ GET /api/bookings?resourceId=X │ ADMIN only (filter) │
 * │ GET /api/bookings?date=YYYY-MM-DD │ ADMIN only (filter) │
 * │ GET /api/bookings/my │ Any auth user │
 * │ GET /api/bookings/{id} │ Any auth user │
 * │ PUT /api/bookings/{id}/approve │ ADMIN only │
 * │ PUT /api/bookings/{id}/reject │ ADMIN only │
 * │ PUT /api/bookings/{id}/cancel │ Owner or ADMIN │
 * │ DELETE /api/bookings/{id} │ ADMIN only │
 * └─────────────────────────────────────────────────────────────┘
 *
 * HOW userId AND role ARE EXTRACTED:
 * The JWT filter (JwtAuthFilter) validates the token and populates the
 * Spring SecurityContext (email as principal, ROLE_XXX as authority).
 * Helper methods resolveUserId() and resolveRole() extract these values.
 *
 * ─── POSTMAN TEST GUIDE ──────────────────────────────────────
 *
 * 1. Register user POST /api/auth/register
 * Body: {"name":"Alice","email":"alice@campus.com","password":"pass123"}
 * → save token, userId
 *
 * 2. Create resource POST /api/resources
 * Auth: Bearer <adminToken>
 * Body: {"name":"Lab 101","type":"LAB","location":"Block
 * A","capacity":30,"isAvailable":true}
 * → save id as resourceId
 *
 * 3. Create booking POST /api/bookings
 * Auth: Bearer <token>
 * Body:
 * {"resourceId":"...","startTime":"2026-05-01T09:00","endTime":"2026-05-01T11:00",
 * "purpose":"Team meeting","attendeeCount":5}
 * → status = PENDING; save id as bookingId
 *
 * 4. Approve PUT /api/bookings/<bookingId>/approve
 * Auth: Bearer <adminToken>
 * Body: {"note":"Approved for team use"}
 * → status = APPROVED
 *
 * 5. Reject PUT /api/bookings/<bookingId>/reject
 * Auth: Bearer <adminToken>
 * Body: {"note":"Resource not available on this date"}
 *
 * 6. Filter GET /api/bookings?status=APPROVED
 * GET /api/bookings?resourceId=X&date=2026-05-01
 *
 * 7. Delete DELETE /api/bookings/<bookingId>
 * Auth: Bearer <adminToken>
 * → status = DELETED (soft delete, document kept in MongoDB)
 *
 * 8. Conflict test: Create two overlapping bookings, approve first,
 * then try to approve second → HTTP 409 BOOKING_CONFLICT
 * ================================================================
 */
@Slf4j
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    // ════════════════════════════════════════════════════════════
    // POST /api/bookings — Create Booking
    // ════════════════════════════════════════════════════════════

    /**
     * Create a new booking request.
     *
     * @Valid triggers DTO bean-validation (required fields, future dates, etc.)
     *        Service layer then validates:
     *        - startTime < endTime (cross-field rule)
     *        - attendeeCount ≥ 1
     *        - resource exists and is available
     *
     *        Returns HTTP 201 CREATED with full booking DTO.
     */
    @PostMapping
    public ResponseEntity<BookingDTO.BookingResponse> createBooking(
            @Valid @RequestBody BookingDTO.BookingRequest request) {

        String userId = resolveUserId();
        log.info("POST /api/bookings — userId={}", userId);

        BookingDTO.BookingResponse response = bookingService.createBooking(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ════════════════════════════════════════════════════════════
    // GET /api/bookings — Get All Bookings (ADMIN, with filters)
    // ════════════════════════════════════════════════════════════

    /**
     * Returns all bookings. ADMIN only.
     *
     * Supports optional query parameters for filtering:
     * - status : e.g. ?status=APPROVED
     * - resourceId : e.g. ?resourceId=abc123
     * - userId : e.g. ?userId=xyz789
     * - date : e.g. ?date=2026-04-10 (ISO date format YYYY-MM-DD)
     *
     * Filters can be combined:
     * - ?status=APPROVED&resourceId=abc123
     * - ?date=2026-04-10&status=PENDING
     *
     * Soft-deleted bookings (status=DELETED) are excluded automatically.
     *
     * ROLE CHECK: Enforced here AND in service layer for defence-in-depth.
     */
    @GetMapping
    public ResponseEntity<List<BookingDTO.BookingResponse>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        // Role guard — only admin may list all bookings
        assertAdmin();

        log.info("GET /api/bookings — filters: status={}, resourceId={}, userId={}, date={}",
                status, resourceId, userId, date);

        // Build filter DTO from query params (nulls are ignored by service)
        BookingDTO.BookingFilter filter = new BookingDTO.BookingFilter(status, resourceId, userId, date);

        return ResponseEntity.ok(bookingService.getAllBookings(filter));
    }

    // ════════════════════════════════════════════════════════════
    // GET /api/bookings/my — Get Own Bookings
    // ════════════════════════════════════════════════════════════

    /**
     * Returns all bookings belonging to the authenticated user.
     * Soft-deleted bookings are excluded.
     */
    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO.BookingResponse>> getMyBookings() {
        String userId = resolveUserId();
        log.info("GET /api/bookings/my — userId={}", userId);
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    // ════════════════════════════════════════════════════════════
    // GET /api/bookings/{id} — Get Single Booking
    // ════════════════════════════════════════════════════════════

    /**
     * Returns a single booking by its MongoDB document ID. Returns 404 if not
     * found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO.BookingResponse> getBookingById(@PathVariable String id) {
        log.info("GET /api/bookings/{}", id);
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // ════════════════════════════════════════════════════════════
    // PUT /api/bookings/{id}/approve — Approve Booking (ADMIN)
    // ════════════════════════════════════════════════════════════

    /**
     * Approve a PENDING booking (ADMIN only).
     * Runs full conflict detection — returns HTTP 409 if slot is already taken.
     * Transition: PENDING → APPROVED
     *
     * Body (optional): {"note": "Approved for event use"}
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<BookingDTO.BookingResponse> approveBooking(
            @PathVariable String id,
            @RequestBody(required = false) BookingDTO.AdminActionRequest body) {

        String role = resolveRole();
        String note = body != null ? body.getNote() : null;

        log.info("PUT /api/bookings/{}/approve — role={}", id, role);
        return ResponseEntity.ok(bookingService.approveBooking(id, note, role));
    }

    // ════════════════════════════════════════════════════════════
    // PUT /api/bookings/{id}/reject — Reject Booking (ADMIN)
    // ════════════════════════════════════════════════════════════

    /**
     * Reject a PENDING booking (ADMIN only).
     * Transition: PENDING → REJECTED
     *
     * Body (optional): {"note": "Resource not available on this date"}
     * Note is stored as both adminNote and rejectionReason.
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingDTO.BookingResponse> rejectBooking(
            @PathVariable String id,
            @RequestBody(required = false) BookingDTO.AdminActionRequest body) {

        String role = resolveRole();
        String note = body != null ? body.getNote() : null;

        log.info("PUT /api/bookings/{}/reject — role={}", id, role);
        return ResponseEntity.ok(bookingService.rejectBooking(id, note, role));
    }

    // ════════════════════════════════════════════════════════════
    // PUT /api/bookings/{id}/cancel — Cancel Booking
    // ════════════════════════════════════════════════════════════

    /**
     * Cancel a booking.
     * - Owners can cancel their own PENDING or APPROVED bookings.
     * - Admins can cancel any booking.
     * Transition: PENDING|APPROVED → CANCELLED
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO.BookingResponse> cancelBooking(@PathVariable String id) {
        String userId = resolveUserId();
        String role = resolveRole();

        log.info("PUT /api/bookings/{}/cancel — userId={} role={}", id, userId, role);
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId, role));
    }

    // ════════════════════════════════════════════════════════════
    // DELETE /api/bookings/{id} — Soft-Delete Booking (ADMIN)
    // ════════════════════════════════════════════════════════════

    /**
     * Soft-delete a booking (ADMIN only).
     *
     * WHY SOFT DELETE?
     * Rather than physically removing the document from MongoDB, we set
     * status = DELETED and record deletedAt. This approach:
     * - Preserves the full audit trail for billing/compliance/disputes
     * - Allows accidental deletion recovery
     * - Does not break historical reports or analytics
     *
     * Returns HTTP 200 OK with the final booking state (status = DELETED).
     * Use 204 No Content if you prefer not to return a body.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<BookingDTO.BookingResponse> deleteBooking(@PathVariable String id) {
        String role = resolveRole();

        log.info("DELETE /api/bookings/{} — role={} (soft delete)", id, role);
        BookingDTO.BookingResponse response = bookingService.deleteBooking(id, role);

        // Return 200 with body so client can confirm the DELETED status
        return ResponseEntity.ok(response);
    }

    // ════════════════════════════════════════════════════════════
    // SECURITY HELPERS
    // ════════════════════════════════════════════════════════════

    /**
     * Extracts the email from the JWT-populated SecurityContext,
     * then looks up the User document to get the MongoDB ObjectId.
     *
     * Uses email as principal (set by JwtAuthFilter) rather than
     * storing userId directly in the token for security — email is
     * harder to guess/fabricate than an incremented integer ID.
     */
    private String resolveUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName(); // email is the JWT subject
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new com.smartcampus.exception.ResourceNotFoundException(
                        "Authenticated user not found: " + email))
                .getId();
    }

    /**
     * Extracts the role string (without the "ROLE_" prefix) from the
     * SecurityContext's GrantedAuthority list.
     *
     * Example: GrantedAuthority "ROLE_ADMIN" → returns "ADMIN"
     * Defaults to "STUDENT" if no ROLE_ authority is present.
     */
    private String resolveRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.replace("ROLE_", ""))
                .findFirst()
                .orElse("STUDENT");
    }

    /**
     * Throws a 403-mapped exception if the current user is not ADMIN.
     * Provides defence-in-depth beyond the JWT role check.
     */
    private void assertAdmin() {
        if (!"ADMIN".equalsIgnoreCase(resolveRole())) {
            throw com.smartcampus.exception.BookingException.unauthorized("view all bookings");
        }
    }
}
