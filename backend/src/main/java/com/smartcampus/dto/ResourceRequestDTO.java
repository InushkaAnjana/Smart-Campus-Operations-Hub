package com.smartcampus.dto;

import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * ================================================================
 * ResourceRequestDTO — Inbound DTO for Creating / Updating a Resource
 * ================================================================
 * Used as @RequestBody in:
 *   POST /api/resources          → createResource()
 *   PUT  /api/resources/{id}     → updateResource()
 *
 * Validation annotations drive the @Valid check in the controller.
 * Any violation is caught by GlobalExceptionHandler and returned
 * as a structured 422 error with a list of field messages.
 *
 * ROLE RULES:
 *   Only ADMIN can submit this DTO (enforced via @PreAuthorize in
 *   ResourceController; here we only define what a valid payload is).
 * ================================================================
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceRequestDTO {

    // ── Required fields ─────────────────────────────────────────

    /**
     * Human-readable resource name. Must be unique.
     * Validation: not blank.
     * Example: "Computer Lab B-201"
     */
    @NotBlank(message = "Resource name is required and must not be blank")
    @Size(max = 100, message = "Resource name must not exceed 100 characters")
    private String name;

    /**
     * Resource category.
     * Validation: must be one of ROOM, LAB, EQUIPMENT.
     * Supplied as the enum constant string (case-sensitive) in JSON.
     */
    @NotNull(message = "Resource type is required (ROOM, LAB, or EQUIPMENT)")
    private ResourceType type;

    // ── Optional but validated ───────────────────────────────────

    /**
     * Optional free-text description / notes.
     * Max 500 characters to keep documents lean.
     */
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    /**
     * Physical location string.
     * Example: "Block A, Floor 3, Room 305"
     */
    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;

    /**
     * Maximum capacity (persons or units).
     * Validation: must be a positive integer (> 0).
     */
    @Positive(message = "Capacity must be a positive number greater than 0")
    private Integer capacity;

    /**
     * Optional list of human-readable availability windows.
     * Convention: "DAY HH:mm-HH:mm"
     * Example: ["MON 08:00-20:00", "WED 08:00-20:00"]
     *
     * This is informational for display; actual booking conflict
     * checking is handled by BookingService.
     */
    private List<String> availabilityWindows;

    /**
     * Operational status of the resource.
     * Defaults to ACTIVE if not provided (handled in service).
     */
    private ResourceStatus status;

    /**
     * Real-time availability flag for booking integration.
     * Defaults to true if not provided (handled in service).
     */
    private Boolean isAvailable;
}
