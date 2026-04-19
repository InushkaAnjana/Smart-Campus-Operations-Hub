package com.smartcampus.service.impl;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Notification;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ================================================================
 * NotificationServiceImpl - Notifications Implementation
 * ================================================================
 * Owner: Member 4 - Notifications Module
 *
 * ── NOTIFICATION TRIGGER CONTRACT ────────────────────────────────
 *  Other services call sendNotification() to create notifications:
 *
 *  BookingServiceImpl.approveBooking()  → type = "BOOKING_APPROVED"
 *  BookingServiceImpl.rejectBooking()   → type = "BOOKING_REJECTED"
 *  BookingServiceImpl.cancelBooking()   → type = "BOOKING_CANCELLED"
 *  TicketServiceImpl.updateStatus()     → type = "TICKET_UPDATED"
 *  TicketServiceImpl.addComment()       → type = "TICKET_COMMENT"
 *
 * ── READ STATE MANAGEMENT ────────────────────────────────────────
 *  markAsRead(id)      → Updates a single notification's isRead to true (save+return)
 *  markAllAsRead(uid)  → Bulk update via MongoTemplate.updateMulti()
 *                        (MongoRepository does not support bulk conditional updates)
 *
 * ── BULK UPDATE DESIGN ───────────────────────────────────────────
 *  JPA's @Modifying JPQL queries are NOT available in Spring Data MongoDB.
 *  We use MongoTemplate.updateMulti() with a Criteria query to efficiently
 *  update all unread notifications for a user in a single DB round-trip.
 * ================================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository         userRepository;
    private final MongoTemplate          mongoTemplate;

    // ════════════════════════════════════════════════════════════
    // GET
    // ════════════════════════════════════════════════════════════

    /**
     * Returns all notifications for a user, most recent first.
     * Excluded deleted notifications (hard-delete from DELETE /api/notifications/{id}).
     */
    @Override
    public List<NotificationDTO.NotificationResponse> getNotificationsForUser(String userId) {
        log.debug("Fetching notifications for userId={}", userId);
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns the count of unread notifications for the notification bell badge.
     */
    @Override
    public long getUnreadCount(String userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    // ════════════════════════════════════════════════════════════
    // MARK AS READ
    // ════════════════════════════════════════════════════════════

    /**
     * Marks a single notification as read.
     * Loads, updates, and saves the document — returns the updated DTO.
     */
    @Override
    public NotificationDTO.NotificationResponse markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        notification.setIsRead(true);
        log.debug("Marking notification id={} as read", notificationId);
        return mapToResponse(notificationRepository.save(notification));
    }

    /**
     * Marks ALL unread notifications for a given user as read in one bulk operation.
     *
     * Uses MongoTemplate.updateMulti() because Spring Data MongoDB repositories
     * do not natively support conditional bulk updates like JPA's @Modifying.
     *
     * Query:  { recipientId: userId, isRead: false }
     * Update: { $set: { isRead: true } }
     */
    @Override
    public void markAllAsRead(String userId) {
        log.debug("Bulk marking all notifications as read for userId={}", userId);
        Query  query  = new Query(Criteria.where("recipientId").is(userId).and("isRead").is(false));
        Update update = new Update().set("isRead", true);
        mongoTemplate.updateMulti(query, update, Notification.class);
    }

    // ════════════════════════════════════════════════════════════
    // DELETE
    // ════════════════════════════════════════════════════════════

    /**
     * Hard-deletes a single notification by ID.
     * Called by DELETE /api/notifications/{id}.
     *
     * NOTE: Hard delete is used here because notification records are ephemeral
     * UI state, not business data that requires an audit trail.
     */
    @Override
    public void deleteNotification(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        notificationRepository.delete(notification);
        log.info("Notification deleted: id={}", notificationId);
    }

    // ════════════════════════════════════════════════════════════
    // CREATE (Internal — called by other services)
    // ════════════════════════════════════════════════════════════

    /**
     * Creates and persists a notification for the given recipient.
     *
     * NOTIFICATION TRIGGER FLOW:
     *   1. Another service (e.g. BookingServiceImpl) calls this method
     *      passing the target userId, a short title, a descriptive message,
     *      and the event type string (e.g. "BOOKING_APPROVED").
     *   2. This method verifies the recipient user exists (prevents orphan notifications).
     *   3. The Notification document is built, initialised via onCreate(), and saved.
     *   4. (Future) A WebSocket push would be triggered here for real-time delivery.
     *
     * @param recipientId MongoDB userId of the notification target
     * @param title       Short heading for the notification (e.g. "Booking Approved")
     * @param message     Full descriptive text (e.g. "Your booking for Lab A was approved.")
     * @param type        Event type string (e.g. "BOOKING_APPROVED", "TICKET_UPDATED")
     */
    @Override
    public void sendNotification(String recipientId, String title, String message, String type) {
        // Verify recipient exists to prevent orphaned notifications
        userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + recipientId));

        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        notification.onCreate(); // Sets createdAt = now, isRead = false
        notificationRepository.save(notification);
        log.info("Notification sent: recipientId={} type={}", recipientId, type);

        // TODO: Member 4 - Real-time WebSocket push
        // webSocketService.pushToUser(recipientId, mapToResponse(notification));
    }

    // ─── Helper ─────────────────────────────────────────────────

    /**
     * Maps a Notification document to a safe response DTO.
     * All fields including recipientId are included in the response.
     */
    private NotificationDTO.NotificationResponse mapToResponse(Notification notification) {
        return NotificationDTO.NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .recipientId(notification.getRecipientId())
                .build();
    }
}
