package com.smartcampus.controller;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ================================================================
 * BookingController - Booking Management Endpoints
 * ================================================================
 * Owner: Member 2 - Booking Management Module
 * Base URL: /api/bookings
 *
 * TODO Member 2:
 *  - GET    /api/bookings                  → All bookings (ADMIN)
 *  - GET    /api/bookings/{id}             → Get single booking
 *  - GET    /api/bookings/user/{userId}    → Bookings by user
 *  - GET    /api/bookings/resource/{resId} → Bookings by resource
 *  - POST   /api/bookings                  → Create new booking
 *  - PATCH  /api/bookings/{id}/status      → Update status (ADMIN)
 *  - DELETE /api/bookings/{id}             → Cancel booking
 *  - GET    /api/bookings/check-availability → Check time slot availability
 * ================================================================
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class BookingController {

    private final BookingService bookingService;

    /** GET /api/bookings - Get all bookings (Admin only) */
    @GetMapping
    // TODO: Member 2 - Add @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingDTO.BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    /** GET /api/bookings/{id} - Get booking by ID */
    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO.BookingResponse> getBookingById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    /** GET /api/bookings/user/{userId} - Get bookings for a specific user */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingDTO.BookingResponse>> getBookingsByUser(@PathVariable String userId) {
        // TODO: Member 2 - Ensure user can only see their own bookings unless ADMIN
        return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
    }

    /** GET /api/bookings/resource/{resourceId} - Get bookings for a resource */
    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<BookingDTO.BookingResponse>> getBookingsByResource(@PathVariable String resourceId) {
        return ResponseEntity.ok(bookingService.getBookingsByResource(resourceId));
    }

    /**
     * POST /api/bookings - Create a new booking
     * TODO: Member 2 - Extract userId from JWT token instead of request param
     */
    @PostMapping
    public ResponseEntity<BookingDTO.BookingResponse> createBooking(
            @RequestParam String userId, // TODO: Member 2 → Replace with @AuthenticationPrincipal
            @Valid @RequestBody BookingDTO.BookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(userId, request));
    }

    /** PATCH /api/bookings/{id}/status - Update booking status */
    @PatchMapping("/{id}/status")
    // TODO: Member 2 - Add @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingDTO.BookingResponse> updateBookingStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }

    /** DELETE /api/bookings/{id} - Cancel a booking */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable String id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.noContent().build();
    }
}
