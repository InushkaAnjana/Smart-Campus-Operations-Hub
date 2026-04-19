package com.smartcampus.service;

import com.smartcampus.dto.NotificationDTO;

import java.util.List;

/**
 * ================================================================
 * NotificationService Interface
 * ================================================================
 * Owner: Member 4 - Notifications Module
 *
 * Defines the contract for notification operations:
 *  - getNotificationsForUser() → Fetch all notifications for a user
 *  - getUnreadCount()          → Count unread badge number
 *  - markAsRead()              → Mark one notification as read
 *  - markAllAsRead()           → Bulk mark all as read for a user
 *  - deleteNotification()      → Remove a notification permanently
 *  - sendNotification()        → Internal trigger called by other services
 *
 * NOTIFICATION TRIGGERS:
 *  BookingService  → BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED
 *  TicketService   → TICKET_OPENED, TICKET_UPDATED, TICKET_COMMENT
 * ================================================================
 */
public interface NotificationService {

    /**
     * Returns all notifications for a user, most recent first.
     */
    List<NotificationDTO.NotificationResponse> getNotificationsForUser(String userId);

    /**
     * Returns the count of unread notifications for the frontend badge.
     */
    long getUnreadCount(String userId);

    /**
     * Marks a single notification as read and returns the updated DTO.
     * Throws ResourceNotFoundException (404) if notificationId is not found.
     */
    NotificationDTO.NotificationResponse markAsRead(String notificationId);

    /**
     * Bulk-marks all unread notifications for a user as read.
     * Uses MongoTemplate for an efficient single-query update.
     */
    void markAllAsRead(String userId);

    /**
     * Permanently deletes a notification by ID.
     * Throws ResourceNotFoundException (404) if notificationId is not found.
     */
    void deleteNotification(String notificationId);

    /**
     * Internal method: creates and persists a notification for the given recipient.
     * Called by BookingService, TicketService when business events occur.
     *
     * @param recipientId MongoDB userId of the target user
     * @param title       Short heading (e.g. "Booking Approved")
     * @param message     Full descriptive message
     * @param type        Event type string (e.g. "BOOKING_APPROVED")
     */
    void sendNotification(String recipientId, String title, String message, String type);
}
