package com.smartcampus.service;

import com.smartcampus.dto.BookingDTO;

import java.util.List;

/**
 * ================================================================
 * BookingService — Booking Management Interface
 * ================================================================
 *
 * WORKFLOW RULES enforced by the implementation:
 *
 *  createBooking  → status starts as PENDING; no conflict check here
 *  approveBooking → PENDING → APPROVED; conflict detection runs HERE
 *  rejectBooking  → PENDING → REJECTED; adminNote AND rejectionReason stored
 *  cancelBooking  → PENDING|APPROVED → CANCELLED
 *                   (users can cancel own; admins can cancel any)
 *  deleteBooking  → SOFT DELETE: sets status = DELETED, records deletedAt
 *                   ADMIN only; preserves audit trail
 *
 * READ METHODS:
 *  getAllBookings     → ADMIN only; supports optional filters
 *  getUserBookings   → returns only the calling user's non-deleted bookings
 *  getBookingById    → anyone; validates existence
 * ================================================================
 */
public interface BookingService {

    /**
     * Create a new booking (any authenticated user).
     * Validates: startTime < endTime, attendees ≥ 1, resource exists & available.
     * Status: PENDING
     */
    BookingDTO.BookingResponse createBooking(String userId, BookingDTO.BookingRequest request);

    /**
     * Approve a PENDING booking (ADMIN only).
     * Runs conflict detection — throws BookingException (409) if slot is taken.
     * Transition: PENDING → APPROVED
     */
    BookingDTO.BookingResponse approveBooking(String bookingId, String adminNote, String adminRole);

    /**
     * Reject a PENDING booking (ADMIN only).
     * Stores both adminNote (general) and rejectionReason (displayed to user).
     * Transition: PENDING → REJECTED
     */
    BookingDTO.BookingResponse rejectBooking(String bookingId, String adminNote, String adminRole);

    /**
     * Cancel a booking.
     *  - USER can cancel their own PENDING or APPROVED bookings.
     *  - ADMIN can cancel any booking.
     * Transition: PENDING|APPROVED → CANCELLED
     */
    BookingDTO.BookingResponse cancelBooking(String bookingId, String requestingUserId, String requestingRole);

    /**
     * Soft-delete a booking (ADMIN only).
     *
     * WHY SOFT DELETE?
     *  Instead of physically removing the document, we set status = DELETED
     *  and record deletedAt. This preserves the audit trail for:
     *   - Billing disputes
     *   - Abuse investigations
     *   - Accidental deletion recovery
     *  Hard deletes are irreversible and break historical reporting.
     *
     * Transition: Any status → DELETED
     * HTTP: Returns 200 with final booking state (or 204 with empty body).
     */
    BookingDTO.BookingResponse deleteBooking(String bookingId, String requestingRole);

    /**
     * Get ALL bookings (ADMIN only) with optional filtering.
     *
     * Filters supported (all optional, can be combined):
     *  - status     : e.g. PENDING, APPROVED, REJECTED
     *  - resourceId : bookings for a specific resource
     *  - userId     : bookings created by a specific user
     *  - date       : bookings whose startTime falls on this LocalDate
     *
     * Filtering logic is applied in the service layer using repository
     * derived queries. DELETED bookings are excluded by default.
     */
    List<BookingDTO.BookingResponse> getAllBookings(BookingDTO.BookingFilter filter);

    /**
     * Get bookings for the currently authenticated user.
     * Excludes soft-deleted bookings.
     */
    List<BookingDTO.BookingResponse> getUserBookings(String userId);

    /** Get a single booking by ID. Throws 404 if not found. */
    BookingDTO.BookingResponse getBookingById(String bookingId);
}
