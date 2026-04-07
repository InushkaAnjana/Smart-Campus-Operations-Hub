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
 * Notification Document (MongoDB)
 * ================================================================
 * Owner: Member 4 - Notifications Module
 *
 * TODO Member 4:
 *  - Add notification types: BOOKING_CONFIRMED, TICKET_UPDATE,
 *    MAINTENANCE_ALERT, SYSTEM_ANNOUNCEMENT, etc.
 *  - Add isRead flag for unread badge count
 *  - Add push notification / email integration
 *  - Add bulk notification sending (broadcast to role)
 *  - Add scheduled/reminder notifications for upcoming bookings
 * ================================================================
 */
@Document(collection = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    private String id; // MongoDB ObjectId stored as String

    @NotBlank
    private String title;

    private String message;

    // TODO: Member 4 - Replace with NotificationType enum
    private String type; // BOOKING_CONFIRMED | TICKET_UPDATE | SYSTEM_ALERT | etc.

    @lombok.Builder.Default
    private Boolean isRead = false;

    private LocalDateTime createdAt;

    // --- Relationships (stored as ID in MongoDB) ---
    private String recipientId; // ID of the user this notification is for

    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
