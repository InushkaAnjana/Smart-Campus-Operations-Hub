package com.smartcampus.model;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * ================================================================
 * Booking — MongoDB Document
 * ================================================================
 * Lifecycle: PENDING → APPROVED / REJECTED → CANCELLED / COMPLETED
 *            Any state → DELETED  (soft delete — admin only)
 *
 * COMPOUND INDEX on [resourceId, status, startTime, endTime]:
 *   Enables fast conflict detection without full collection scan.
 *   The BookingRepository.findOverlappingApprovedBookings query uses
 *   all four indexed fields in its filter, making it O(logN) instead of O(N).
 *
 * SOFT DELETE (deletedAt + status = DELETED):
 *   Instead of removing documents, we mark them DELETED and record
 *   the deletion timestamp. Benefits:
 *     - Full audit trail: who booked what, when it was deleted
 *     - Recoverable: admin can un-delete if needed
 *     - Safe for billing/dispute investigations
 * ================================================================
 */
@Document(collection = "bookings")
@CompoundIndex(name = "resource_time_idx",
        def = "{'resourceId': 1, 'status': 1, 'startTime': 1, 'endTime': 1}")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    private String id;

    /** The ID of the user who created this booking */
    @Indexed
    private String userId;

    /** The ID of the resource being booked */
    @Indexed
    private String resourceId;

    /** Current lifecycle status (see BookingStatus enum) */
    private BookingStatus status;

    /** Why the resource is needed (e.g., "Team standup meeting") */
    private String purpose;

    /** Expected number of attendees — must be ≥ 1 */
    private Integer attendeeCount;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    /**
     * General admin note (used for approval notes).
     * For rejections, also set rejectionReason for clarity.
     */
    private String adminNote;

    /**
     * Explicit rejection reason — set when status transitions to REJECTED.
     * Displayed separately from adminNote so the UI can show it prominently.
     */
    private String rejectionReason;

    // ─── Lifecycle Timestamps ──────────────────────────────────
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime cancelledAt;

    /**
     * Populated when a soft delete is performed (status = DELETED).
     * Null for all non-deleted bookings.
     */
    private LocalDateTime deletedAt;

    /** Call on first save — initialises createdAt and updatedAt */
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /** Call on every subsequent save — keeps updatedAt current */
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
