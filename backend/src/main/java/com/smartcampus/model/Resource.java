package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

/**
 * ================================================================
 * Resource Document (Campus Facilities & Resources) - MongoDB
 * ================================================================
 * Owner: Member 3 - Facilities & Resources Module
 *
 * TODO Member 3:
 *  - Add capacity field
 *  - Add location/building details
 *  - Add resource type enum (ROOM, LAB, EQUIPMENT, etc.)
 *  - Add availability schedule logic
 *  - Add image URL field for resource photos
 * ================================================================
 */
@Document(collection = "resources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    private String id; // MongoDB ObjectId stored as String

    @NotBlank
    private String name;

    private String description;

    // TODO: Member 3 - Replace with ResourceType enum
    private String type; // e.g., "ROOM", "LAB", "EQUIPMENT"

    private String location; // e.g., "Building A, Floor 2"

    private Integer capacity;

    @lombok.Builder.Default
    private Boolean isAvailable = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // --- Relationships (referenced by ID in BookingRepository / TicketRepository) ---
    // TODO: Member 2 - Query bookings by resourceId in BookingRepository
    // TODO: Member 4 - Query tickets by resourceId in TicketRepository

    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
