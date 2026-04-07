package com.smartcampus.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ================================================================
 * BookingDTO — Request and Response DTOs for Booking Module
 * ================================================================
 */
public class BookingDTO {

    // ─── Request ───────────────────────────────────────────────
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
        private LocalDateTime endTime;

        @NotBlank(message = "Purpose is required")
        private String purpose;

        @Min(value = 1, message = "Attendee count must be at least 1")
        private Integer attendeeCount;
    }

    // ─── Admin Action Request (approve / reject) ────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminActionRequest {
        private String note; // Optional: reason for rejection or approval note
    }

    // ─── Response ──────────────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingResponse {
        private String id;
        private String status;         // String so frontend gets human-readable value
        private String purpose;
        private int attendeeCount;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String adminNote;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime approvedAt;
        private LocalDateTime rejectedAt;
        private LocalDateTime cancelledAt;

        // Nested summaries — populated by service via ID lookups
        private UserSummary user;
        private ResourceSummary resource;
    }

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
