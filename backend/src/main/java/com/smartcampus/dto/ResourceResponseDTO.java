package com.smartcampus.dto;

import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ================================================================
 * ResourceResponseDTO — Outbound DTO for API Resource Responses
 * ================================================================
 * Returned by all resource endpoints:
 *   GET  /api/resources             → List<ResourceResponseDTO>
 *   GET  /api/resources/{id}        → ResourceResponseDTO
 *   POST /api/resources             → ResourceResponseDTO (201 Created)
 *   PUT  /api/resources/{id}        → ResourceResponseDTO (200 OK)
 *
 * Design Notes:
 *   - Contains all public-safe fields (no internal DB detail).
 *   - Uses proper enum types (ResourceType, ResourceStatus) so the
 *     frontend receives typed strings like "ROOM", "ACTIVE".
 *   - createdAt / updatedAt exposed for audit trail display.
 *   - Built via ResourceServiceImpl.mapToResponseDTO().
 * ================================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponseDTO {

    /** MongoDB ObjectId as String */
    private String id;

    /** Human-readable name of the resource */
    private String name;

    /** Optional description / notes */
    private String description;

    /**
     * Resource category: ROOM | LAB | EQUIPMENT.
     * Serialized as the enum name string in JSON.
     */
    private ResourceType type;

    /** Physical location string */
    private String location;

    /** Maximum capacity (persons or units) */
    private Integer capacity;

    /**
     * Optional availability windows, e.g.
     * ["MON 08:00-20:00", "WED 08:00-20:00"]
     */
    private List<String> availabilityWindows;

    /**
     * Real-time availability flag (legacy, used by BookingService).
     * true  → resource slot is free
     * false → resource is currently taken / blocked
     */
    private Boolean isAvailable;

    /**
     * Operational status: ACTIVE | OUT_OF_SERVICE.
     * Clients should check this before attempting to book.
     */
    private ResourceStatus status;

    /** Timestamp when this resource was first created (ISO-8601) */
    private LocalDateTime createdAt;

    /** Timestamp of the last update (ISO-8601) */
    private LocalDateTime updatedAt;
}
