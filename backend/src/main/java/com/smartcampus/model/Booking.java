package com.smartcampus.model;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * ================================================================
 * Booking - MongoDB Document
 * ================================================================
 * Lifecycle: PENDING → APPROVED / REJECTED → CANCELLED / COMPLETED
 *
 * Compound index on [resourceId, status, startTime, endTime] enables
 * fast conflict queries without a full collection scan.
 * ================================================================
 */
@Document(collection = "bookings")
@CompoundIndex(name = "resource_time_idx", def = "{'resourceId': 1, 'status': 1, 'startTime': 1, 'endTime': 1}")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String resourceId;

    private BookingStatus status;

    private String purpose;

    private Integer attendeeCount;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String adminNote;

    private LocalDateTime cancelledAt;

    private LocalDateTime approvedAt;

    private LocalDateTime rejectedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
