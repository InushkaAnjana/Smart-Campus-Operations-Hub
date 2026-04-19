package com.smartcampus.model;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * ================================================================
 * Notification Document (MongoDB)
 * ================================================================
 * Owner: Member 4 - Notifications Module
 *
 * NOTIFICATION TRIGGER EVENTS:
 *
 *  BOOKING_PENDING    → User submitted a booking request (confirms receipt)
 *  BOOKING_APPROVED   → Admin approved the user's booking request
 *  BOOKING_REJECTED   → Admin rejected the user's booking request
 *  BOOKING_CANCELLED  → A booking (by user or admin) was cancelled
 *
 *  TICKET_OPENED      → A new maintenance/incident ticket was created
 *  TICKET_UPDATED     → A technician changed the ticket status
 *  TICKET_COMMENT     → A new comment was added to a ticket thread
 *
 *  SYSTEM_ALERT       → Generic system-level broadcast notification
 *
 * FIELD NOTES:
 *  - recipientId : userId of the user who should receive this notification
 *                 Indexed for fast per-user queries (notification bell count)
 *  - type        : One of the strings from the list above
 *  - isRead      : Defaults to false; set to true via markAsRead() or markAllAsRead()
 *  - createdAt   : Set by onCreate(); used for descending sort in the UI
 *
 * HOW NOTIFICATIONS ARE CREATED:
 *  Other services (BookingServiceImpl, TicketServiceImpl) call:
 *    notificationService.sendNotification(userId, title, message, type)
 *  This method persists the notification document and (optionally) pushes
 *  a real-time event via WebSocket.
 * ================================================================
 */
@Document(collection = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    /** Short heading shown in the notification bell (e.g. "Booking Approved") */
    private String title;

    /** Full descriptive text of the event (e.g. "Your booking for Lab A was approved.") */
    private String message;

    /**
     * Event type string — must match one of the trigger event constants in this class.
     * Examples: "BOOKING_APPROVED", "TICKET_UPDATED", "TICKET_COMMENT"
     */
    private String type;

    /**
     * Read status — false on creation, set to true when the user views the notification.
     * Used for unread badge count on the frontend.
     */
    private Boolean isRead;

    /** Timestamp when this notification was persisted. Used for descending sort. */
    private LocalDateTime createdAt;

    /**
     * The MongoDB userId of the intended recipient.
     * Indexed to allow fast querying of a single user's notification feed.
     */
    @Indexed
    private String recipientId;

    /**
     * Initialises default values before the first save.
     * Called manually in NotificationServiceImpl.sendNotification().
     */
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isRead == null) this.isRead = false;
    }
}
