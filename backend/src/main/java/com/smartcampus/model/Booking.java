package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * ================================================================
 * Booking Document (MongoDB)
 * ================================================================
 * Owner: Member 2 - Booking Management Module
 *
 * TODO Member 2:
 *  - Add booking validation (no overlapping slots)
 *  - Add status enum: PENDING, CONFIRMED, CANCELLED, COMPLETED
 *  - Add recurring booking support
 *  - Wire up notification triggers on status change
 *  - Add approval workflow (admin must approve bookings)
 * ================================================================
 */
@Document(collection = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    private String id; // MongoDB ObjectId stored as String

    // TODO: Member 2 - Replace String status with BookingStatus enum
    @lombok.Builder.Default
    private String status = "PENDING"; // PENDING | CONFIRMED | CANCELLED | COMPLETED

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String purpose;

    private Integer attendeeCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // --- Relationships (stored as IDs in MongoDB) ---
    private String userId;     // ID of the user who made the booking
    private String resourceId; // ID of the resource being booked

    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
