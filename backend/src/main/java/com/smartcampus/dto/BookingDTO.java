package com.smartcampus.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ================================================================
 * BookingDTO — Request and Response DTOs for Booking Module
 * ================================================================
 *
 * Inner classes:
 *  - BookingRequest     : Fields required to create a booking
 *  - AdminActionRequest : Optional note when admin approves/rejects
 *  - BookingFilter      : Optional query params for filtering GET /api/bookings
 *  - BookingResponse    : Full booking data returned to the client
 *  - UserSummary        : Lightweight user info embedded in response
 *  - ResourceSummary    : Lightweight resource info embedded in response
 * ================================================================
 */
public class BookingDTO {

    // ─── Create Request ────────────────────────────────────────
    /**
     * Fields the client must/can provide when creating a booking.
     * Bean validation annotations enforce field-level rules.
     * Service layer further validates startTime < endTime (cross-field).
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingRequest {

        @NotBlank(message = "Resource ID is required")
        private String resourceId;

        @NotNull(message = "Start time is required")
        @Future(message = "Start time must be in the future")
        private LocalDateTime startTime;

        @NotNull(message = "End time is required")
        @Future(message = "End time must be in the future")
        private LocalDateTime endTime;

        @NotBlank(message = "Purpose is required")
        @Size(min = 3, max = 255, message = "Purpose must be between 3 and 255 characters")
        private String purpose;

        @NotNull(message = "Attendee count is required")
        @Min(value = 1, message = "Attendee count must be at least 1")
        @Max(value = 1000, message = "Attendee count cannot exceed 1000")
        private Integer attendeeCount;
    }

    // ─── Admin Action Request (approve / reject) ────────────────
    /**
     * Used when admin approves or rejects a booking.
     * The 'note' field is optional — e.g., reason for rejection.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminActionRequest {
        private String note; // Approval note or rejection reason (optional)
    }

    // ─── Booking Filter (GET /api/bookings query params) ────────
    /**
     * Optional filter parameters for admin listing.
     *
     * Filtering logic (applied in service):
     *  - status     : Only return bookings with this status
     *  - resourceId : Only return bookings for this resource
     *  - userId     : Only return bookings created by this user
     *  - date       : Only return bookings whose startTime falls on this date
     *
     * All fields are optional; if none are provided, all bookings are returned.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingFilter {
        private String status;      // e.g. PENDING, APPROVED, REJECTED
        private String resourceId;  // Filter by specific resource
        private String userId;      // Filter by specific user
        private LocalDate date;     // Filter by booking date (startTime date part)
    }

    // ─── Response ──────────────────────────────────────────────
    /**
     * Full booking data returned from all endpoints.
     * Uses String status so frontend receives a human-readable value.
     * rejectionReason is populated only when status = REJECTED.
     * deletedAt is populated only for soft-deleted bookings (ADMIN view).
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingResponse {
        private String id;
        private String status;           // Human-readable: PENDING, APPROVED, etc.
        private String purpose;
        private int attendeeCount;
        private LocalDateTime startTime;
        private LocalDateTime endTime;

        // Admin notes
        private String adminNote;        // General admin message (approval note)
        private String rejectionReason;  // Explicit rejection reason (populated on REJECTED)

        // Timestamps
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime approvedAt;
        private LocalDateTime rejectedAt;
        private LocalDateTime cancelledAt;
        private LocalDateTime deletedAt;  // Populated on soft-delete

        // Nested summaries — ID lookups performed by service layer
        private UserSummary user;
        private ResourceSummary resource;
    }

    // ─── Nested Summaries ──────────────────────────────────────

    @Data
    @AllArgsConstructor
    public static class UserSummary {
        private String id;
        private String name;
        private String email;
    }

    @Data
    @AllArgsConstructor
    public static class ResourceSummary {
        private String id;
        private String name;
        private String location;
        private String type;
    }
}
