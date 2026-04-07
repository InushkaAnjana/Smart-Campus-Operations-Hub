package com.smartcampus.controller;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * ================================================================
 * BookingController — Booking Management REST Endpoints
 * ================================================================
 * Base URL: /api/bookings
 *
 * Endpoint Overview:
 *  POST   /api/bookings              → Create booking (any auth user)
 *  GET    /api/bookings              → Get ALL bookings (ADMIN only)
 *  GET    /api/bookings/my           → Get own bookings (any auth user)
 *  GET    /api/bookings/{id}         → Get single booking
 *  PUT    /api/bookings/{id}/approve → Approve PENDING booking (ADMIN)
 *  PUT    /api/bookings/{id}/reject  → Reject PENDING booking (ADMIN)
 *  PUT    /api/bookings/{id}/cancel  → Cancel booking (owner or ADMIN)
 *
 * How userId and role are extracted:
 *  The JWT filter (JwtAuthFilter) validates the token on every request
 *  and populates the Spring SecurityContext with a UserDetails object
 *  (email as principal, ROLE_XXX as authority).
 *  We use a helper method to resolve the User entity from that email.
 *
 * ─── Postman Test Collection (JSON) ─────────────────────────────
 *
 * 1. Register (POST /api/auth/register)
 *    Body: {"name":"Alice","email":"alice@campus.com","password":"pass123"}
 *    → save the returned "token" and "userId"
 *
 * 2. Create Resource (POST /api/resources)
 *    Header: Authorization: Bearer <token>
 *    Body: {"name":"Lab 101","description":"PC Lab","type":"LAB",
 *           "location":"Block A","capacity":30,"isAvailable":true}
 *    → save the returned "id" as resourceId
 *
 * 3. Create Booking (POST /api/bookings)
 *    Header: Authorization: Bearer <token>
 *    Body: {"resourceId":"<resourceId>","startTime":"2026-05-01T09:00:00",
 *           "endTime":"2026-05-01T11:00:00","purpose":"Team meeting","attendeeCount":5}
 *    → status will be PENDING; save returned "id" as bookingId
 *
 * 4. Register Admin (POST /api/auth/register)
 *    Body: {"name":"Admin","email":"admin@campus.com","password":"admin123","role":"ADMIN"}
 *    → save admin token
 *
 * 5. Approve Booking (PUT /api/bookings/<bookingId>/approve)
 *    Header: Authorization: Bearer <adminToken>
 *    Body: {"note":"Approved for team use"}
 *    → status changes to APPROVED
 *
 * 6. Reject another Booking (PUT /api/bookings/<bookingId>/reject)
 *    Header: Authorization: Bearer <adminToken>
 *    Body: {"note":"Resource not available on this date"}
 *
 * 7. Test Conflict: Create a second overlapping booking then try to approve it
 *    → should receive HTTP 409 BOOKING_CONFLICT
 *
 * 8. Cancel Booking (PUT /api/bookings/<bookingId>/cancel)
 *    Header: Authorization: Bearer <userToken>   (owner can cancel own)
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

    // ─── POST /api/bookings ─────────────────────────────────────
    /**
     * Create a new booking request.
     * Authenticated user's ID is resolved from the JWT token.
     * Booking starts as PENDING until an admin approves it.
     */
    @PostMapping
    public ResponseEntity<BookingDTO.BookingResponse> createBooking(
            @Valid @RequestBody BookingDTO.BookingRequest request) {

        String userId = resolveUserId();
        BookingDTO.BookingResponse response = bookingService.createBooking(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─── GET /api/bookings ──────────────────────────────────────
    /**
     * Get ALL bookings — admin use only.
     * Non-admin users should call /api/bookings/my instead.
     */
    @GetMapping
    public ResponseEntity<List<BookingDTO.BookingResponse>> getAllBookings() {
        // Additional role check beyond JWT — returns 403 if not ADMIN
        assertAdmin();
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // ─── GET /api/bookings/my ───────────────────────────────────
    /** Get bookings belonging to the currently authenticated user */
    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO.BookingResponse>> getMyBookings() {
        String userId = resolveUserId();
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    // ─── GET /api/bookings/{id} ─────────────────────────────────
    /** Get a single booking by ID */
    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO.BookingResponse> getBookingById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // ─── PUT /api/bookings/{id}/approve ─────────────────────────
    /**
     * Approve a PENDING booking.
     * Runs conflict detection — returns 409 if slot is already taken.
     * ADMIN only.
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<BookingDTO.BookingResponse> approveBooking(
            @PathVariable String id,
            @RequestBody(required = false) BookingDTO.AdminActionRequest body) {

        String role = resolveRole();
        String note = body != null ? body.getNote() : null;
        return ResponseEntity.ok(bookingService.approveBooking(id, note, role));
    }

    // ─── PUT /api/bookings/{id}/reject ──────────────────────────
    /** Reject a PENDING booking. ADMIN only. */
    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingDTO.BookingResponse> rejectBooking(
            @PathVariable String id,
            @RequestBody(required = false) BookingDTO.AdminActionRequest body) {

        String role = resolveRole();
        String note = body != null ? body.getNote() : null;
        return ResponseEntity.ok(bookingService.rejectBooking(id, note, role));
    }

    // ─── PUT /api/bookings/{id}/cancel ──────────────────────────
    /** Cancel a booking. Owners can cancel their own; admins can cancel any. */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO.BookingResponse> cancelBooking(@PathVariable String id) {
        String userId = resolveUserId();
        String role = resolveRole();
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId, role));
    }

    // ─── Security Helpers ───────────────────────────────────────

    /**
     * Extracts the email from the JWT-populated SecurityContext,
     * then looks up the User document to get the MongoDB ObjectId.
     */
    private String resolveUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName(); // email is used as the JWT subject
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new com.smartcampus.exception.ResourceNotFoundException(
                        "Authenticated user not found: " + email))
                .getId();
    }

    /**
     * Extracts the role string (without "ROLE_" prefix) from the SecurityContext.
     * e.g., GrantedAuthority "ROLE_ADMIN" → returns "ADMIN"
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

    /** Throws 403 if the current user is not ADMIN */
    private void assertAdmin() {
        if (!"ADMIN".equalsIgnoreCase(resolveRole())) {
            throw com.smartcampus.exception.BookingException.unauthorized("view all bookings");
        }
    }
}
