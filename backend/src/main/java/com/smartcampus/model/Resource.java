package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ================================================================
 * Resource — MongoDB Document for Campus Facilities & Assets
 * ================================================================
 * Collection: "resources"
 *
 * Represents any bookable/manageable campus asset:
 *   - Rooms      (lecture halls, meeting rooms)
 *   - Labs       (computer labs, science labs)
 *   - Equipment  (projectors, cameras, tools)
 *
 * Key Design Decisions:
 *   - type/status stored as enums → validated at DTO layer,
 *     converted to String in MongoDB for human-readable documents.
 *   - availabilityWindows is an embedded list of plain strings
 *     (e.g., "MON 08:00-18:00") for simplicity; can be promoted
 *     to a nested document class if richer querying is needed.
 *   - isAvailable (legacy flag) is KEPT for backward-compatibility
 *     with BookingService which already reads it.
 *   - status (ACTIVE / OUT_OF_SERVICE) is the authoritative
 *     operational state; isAvailable reflects real-time slot
 *     availability within a booking flow.
 *
 * Auditing:
 *   - createdAt / updatedAt set manually via lifecycle methods
 *     (Spring Data @CreatedDate/@LastModifiedDate require
 *     @EnableMongoAuditing which may not be enabled project-wide).
 * ================================================================
 */
@Document(collection = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    // ── Identity ────────────────────────────────────────────────
    @Id
    private String id;

    /** Human-readable name, e.g. "Lab A-101" */
    @Indexed
    private String name;

    /** Optional description / notes about the resource */
    private String description;

    // ── Classification ──────────────────────────────────────────

    /**
     * Resource category: ROOM | LAB | EQUIPMENT.
     * Indexed in MongoDB for fast type-based filtering.
     * Stored as String so Mongo documents remain readable.
     */
    @Indexed
    private ResourceType type;

    /** Physical location, e.g. "Block C, Floor 2" */
    @Indexed
    private String location;

    /**
     * Maximum number of people / units the resource supports.
     * Must be > 0 (validated in DTO).
     */
    private Integer capacity;

    // ── Availability ────────────────────────────────────────────

    /**
     * Optional list of human-readable availability windows.
     * Format convention: "DAY HH:mm-HH:mm"
     * Example: ["MON 08:00-20:00", "WED 08:00-20:00"]
     *
     * This is informational metadata for display; actual booking
     * conflict checking is handled by BookingService.
     */
    private List<String> availabilityWindows;

    /**
     * Real-time availability flag used by BookingService
     * (legacy field retained for backward-compatibility).
     * Defaults to true when a resource is first created.
     */
    private Boolean isAvailable;

    // ── Operational Status ──────────────────────────────────────

    /**
     * Operational status: ACTIVE | OUT_OF_SERVICE.
     * - ACTIVE          → resource is usable, can be booked
     * - OUT_OF_SERVICE  → resource is under maintenance / retired
     *
     * Only ADMIN can set this to OUT_OF_SERVICE.
     * Defaults to ACTIVE on creation.
     */
    @Indexed
    private ResourceStatus status;

    // ── Auditing ────────────────────────────────────────────────
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Lifecycle Hooks ─────────────────────────────────────────

    /** Called on first save. Sets defaults for optional fields. */
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isAvailable == null) this.isAvailable = true;
        if (this.status == null) this.status = ResourceStatus.ACTIVE;
    }

    /** Called before every update to refresh the audit timestamp. */
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
