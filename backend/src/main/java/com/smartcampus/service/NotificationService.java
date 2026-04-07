package com.smartcampus.service;

import com.smartcampus.dto.NotificationDTO;

import java.util.List;

/**
 * ================================================================
 * NotificationService Interface
 * ================================================================
 * Owner: Member 4 - Notifications Module
 *
 * TODO Member 4:
 *  - Implement getNotifications for a user
 *  - Implement markAsRead and markAllAsRead
 *  - Add internal method sendNotification() called by other services
 *  - Optionally add WebSocket push notification support
 * ================================================================
 */
public interface NotificationService {

    List<NotificationDTO.NotificationResponse> getNotificationsForUser(String userId);

    long getUnreadCount(String userId);

    NotificationDTO.NotificationResponse markAsRead(String notificationId);

    void markAllAsRead(String userId);

    /**
     * Internal method - called by BookingService, TicketService, etc.
     * to send a notification to a user.
     *
     * TODO: Member 4 - Implement this method in the service implementation
     */
    void sendNotification(String recipientId, String title, String message, String type);
}
