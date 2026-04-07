package com.smartcampus.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ================================================================
 * Booking DTOs - Booking Management Module
 * ================================================================
 * Owner: Member 2 - Booking Management
 *
 * TODO Member 2:
 *  - Add validation for startTime < endTime
 *  - Add conflict check response structure
 *  - Add BookingStatus enum reference
 * ================================================================
 */
public class BookingDTO {

    // ---- Create Booking Request ----
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingRequest {
        @NotBlank(message = "Resource ID is required")
        private String resourceId; // MongoDB ObjectId as String

        @NotNull(message = "Start time is required")
        @Future(message = "Start time must be in the future")
        private LocalDateTime startTime;

        @NotNull(message = "End time is required")
        private LocalDateTime endTime;

        private String purpose;
        private Integer attendeeCount;
    }

    // ---- Booking Response ----
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingResponse {
        private String id;       // MongoDB ObjectId as String
        private String status;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String purpose;
        private Integer attendeeCount;
        private LocalDateTime createdAt;

        // Nested summary objects
        private UserSummary user;
        private ResourceSummary resource;
    }

    // ---- Nested: User summary inside BookingResponse ----
    @Data
    @AllArgsConstructor
    public static class UserSummary {
        private String id;
        private String name;
        private String email;
    }

    // ---- Nested: Resource summary inside BookingResponse ----
    @Data
    @AllArgsConstructor
    public static class ResourceSummary {
        private String id;
        private String name;
        private String location;
    }
}
