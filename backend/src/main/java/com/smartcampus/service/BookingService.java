package com.smartcampus.service;

import com.smartcampus.dto.BookingDTO;

import java.util.List;

/**
 * ================================================================
 * BookingService — Booking Management Interface
 * ================================================================
 * Workflow rules enforced by the implementation:
 *  - createBooking  → status starts as PENDING; no conflict check yet
 *  - approveBooking → PENDING → APPROVED; conflict check runs HERE
 *  - rejectBooking  → PENDING → REJECTED
 *  - cancelBooking  → APPROVED → CANCELLED (users can cancel own bookings;
 *                                           admins can cancel any)
 *  - getAllBookings  → ADMIN only
 *  - getUserBookings → returns only the calling user's bookings
 * ================================================================
 */
public interface BookingService {

    /** Create a new booking (any authenticated user). Status: PENDING */
    BookingDTO.BookingResponse createBooking(String userId, BookingDTO.BookingRequest request);

    /**
     * Approve a PENDING booking (ADMIN only).
     * Runs conflict detection — throws BookingException if slot is taken.
     */
    BookingDTO.BookingResponse approveBooking(String bookingId, String adminNote, String adminRole);

    /** Reject a PENDING booking (ADMIN only) */
    BookingDTO.BookingResponse rejectBooking(String bookingId, String adminNote, String adminRole);

    /**
     * Cancel a booking (user can cancel own PENDING/APPROVED bookings;
     * admin can cancel any APPROVED booking).
     */
    BookingDTO.BookingResponse cancelBooking(String bookingId, String requestingUserId, String requestingRole);

    /** Get all bookings — ADMIN only */
    List<BookingDTO.BookingResponse> getAllBookings();

    /** Get bookings for the currently authenticated user */
    List<BookingDTO.BookingResponse> getUserBookings(String userId);

    /** Get a single booking by ID */
    BookingDTO.BookingResponse getBookingById(String bookingId);
}
