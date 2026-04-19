package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ================================================================
 * Notification DTOs - Notifications Module
 * ================================================================
 * Owner: Member 4 - Notifications Module
 *
 * DTOs included:
 *  1. NotificationResponse    → Full notification data returned by GET endpoints
 *  2. CreateNotificationRequest → Internal DTO used when other services trigger notifications
 *
 * NOTIFICATION TYPE CONSTANTS (for reference):
 *  Use these string values in the 'type' field:
 *   BOOKING_PENDING    → Booking request submitted
 *   BOOKING_APPROVED   → Booking was approved by admin
 *   BOOKING_REJECTED   → Booking was rejected by admin
 *   BOOKING_CANCELLED  → Booking was cancelled
 *   TICKET_OPENED      → Maintenance ticket created
 *   TICKET_UPDATED     → Ticket status changed by technician
 *   TICKET_COMMENT     → Comment added to a ticket thread
 *   SYSTEM_ALERT       → Generic system notification
 * ================================================================
 */
public class NotificationDTO {

    // ─── Notification Response ─────────────────────────────────

    /**
     * Full notification response DTO.
     * Returned by:
     *  GET  /api/notifications/user/{userId}
     *  PATCH /api/notifications/{id}/read
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationResponse {
        /** MongoDB ObjectId of the notification document */
        private String id;

        /** Short heading (e.g. "Booking Approved") */
        private String title;

        /** Full descriptive message (e.g. "Your booking for Lab A has been approved.") */
        private String message;

        /**
         * Event type string — guides the frontend for icon/colour decisions.
         * See type constants in the class javadoc above.
         */
        private String type;

        /** false = unread (shown in notification bell count); true = already viewed */
        private Boolean isRead;

        /** Timestamp when the notification was created — used for descending sort */
        private LocalDateTime createdAt;

        /** The userId of the notification recipient */
        private String recipientId;
    }

    // ─── Create Notification Request (Internal) ────────────────

    /**
     * Internal DTO used by NotificationService.sendNotification().
     * NOT exposed as a REST endpoint DTO — only used programmatically
     * between services (BookingService, TicketService → NotificationService).
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateNotificationRequest {
        private String recipientId;
        private String title;
        private String message;
        private String type;
    }
}
