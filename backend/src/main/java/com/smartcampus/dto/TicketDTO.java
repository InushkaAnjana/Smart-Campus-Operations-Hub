package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ================================================================
 * Ticket DTOs - Maintenance & Tickets Module
 * ================================================================
 * Owner: Member 4 - Maintenance & Tickets
 *
 * TODO Member 4:
 *  - Add TicketStatus and Priority enum fields
 *  - Add file attachment DTO for images
 *  - Add TicketCommentDTO for update threads
 * ================================================================
 */
public class TicketDTO {

    // ---- Create Ticket Request ----
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description is required")
        private String description;

        private String priority = "MEDIUM";

        @NotBlank(message = "Resource ID is required")
        private String resourceId; // MongoDB ObjectId as String
    }

    // ---- Update Ticket Status Request ----
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketUpdateRequest {
        private String status;
        private String priority;
        // TODO: Member 4 - Add assignedToId once staff management is set up
    }

    // ---- Ticket Response ----
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketResponse {
        private String id;        // MongoDB ObjectId as String
        private String title;
        private String description;
        private String status;
        private String priority;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime resolvedAt;

        // Nested summaries
        private CreatorSummary createdBy;
        private ResourceSummary resource;
    }

    @Data
    @AllArgsConstructor
    public static class CreatorSummary {
        private String id;
        private String name;
        private String email;
    }

    @Data
    @AllArgsConstructor
    public static class ResourceSummary {
        private String id;
        private String name;
    }
}
