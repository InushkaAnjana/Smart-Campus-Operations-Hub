package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ================================================================
 * Resource DTOs - Facilities & Resources Module
 * ================================================================
 * Owner: Member 3 - Facilities & Resources
 *
 * TODO Member 3:
 *  - Add ResourceType enum field
 *  - Add availability schedule DTO
 *  - Add image URL to ResourceResponse
 * ================================================================
 */
public class ResourceDTO {

    // ---- Create / Update Resource (incoming) ----
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResourceRequest {
        @NotBlank(message = "Resource name is required")
        private String name;

        private String description;
        private String type;
        private String location;
        private Integer capacity;
        private Boolean isAvailable;
    }

    // ---- Resource Response (outgoing) ----
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResourceResponse {
        private String id;        // MongoDB ObjectId as String
        private String name;
        private String description;
        private String type;
        private String location;
        private Integer capacity;
        private Boolean isAvailable;
        private LocalDateTime createdAt;
    }
}
