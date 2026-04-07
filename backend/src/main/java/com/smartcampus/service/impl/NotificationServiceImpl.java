package com.smartcampus.service.impl;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Notification;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
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
 * TODO Member 4:
 *  1. Implement sendNotification (internal method used by other services)
 *  2. Implement markAsRead and markAllAsRead
 *  3. Add WebSocket broadcasting for real-time notifications
 *  4. Optionally add email notification via JavaMailSender
 * ================================================================
 */
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public List<NotificationDTO.NotificationResponse> getNotificationsForUser(String userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount(String userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Override
    public NotificationDTO.NotificationResponse markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        notification.setIsRead(true);
        return mapToResponse(notificationRepository.save(notification));
    }

    @Override
    public void markAllAsRead(String userId) {
        // MongoDB bulk update using MongoTemplate (replaces JPA @Modifying query)
        Query query = new Query(Criteria.where("recipientId").is(userId).and("isRead").is(false));
        Update update = new Update().set("isRead", true);
        mongoTemplate.updateMulti(query, update, Notification.class);
    }

    @Override
    public void sendNotification(String recipientId, String title, String message, String type) {
        // Verify recipient exists
        userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + recipientId));

        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        notification.onCreate();
        notificationRepository.save(notification);

        // TODO: Member 4 - Push via WebSocket here
        // webSocketService.pushToUser(recipientId, notification);
    }

    // ---- Helper ----
    private NotificationDTO.NotificationResponse mapToResponse(Notification notification) {
        return NotificationDTO.NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
