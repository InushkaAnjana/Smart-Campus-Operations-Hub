package com.smartcampus.service;

import com.smartcampus.dto.BookingDTO;

import java.util.List;

/**
 * ================================================================
 * BookingService Interface
 * ================================================================
 * Owner: Member 2 - Booking Management Module
 *
 * TODO Member 2:
 *  - Implement createBooking with overlap detection
 *  - Implement cancelBooking with status transition
 *  - Implement admin approval flow (approveBooking)
 *  - Add sendConfirmationNotification on booking confirm
 * ================================================================
 */
public interface BookingService {

    List<BookingDTO.BookingResponse> getAllBookings();

    BookingDTO.BookingResponse getBookingById(String id);

    List<BookingDTO.BookingResponse> getBookingsByUser(String userId);

    List<BookingDTO.BookingResponse> getBookingsByResource(String resourceId);

    BookingDTO.BookingResponse createBooking(String userId, BookingDTO.BookingRequest request);

    BookingDTO.BookingResponse updateBookingStatus(String id, String status);

    void cancelBooking(String id);

    // TODO: Member 2 - Add admin approve/reject
    // BookingDTO.BookingResponse approveBooking(String id);
    // BookingDTO.BookingResponse rejectBooking(String id, String reason);
}
