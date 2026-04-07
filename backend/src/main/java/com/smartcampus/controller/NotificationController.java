package com.smartcampus.controller;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ================================================================
 * NotificationController - Notifications Endpoints
 * ================================================================
 * Owner: Member 4 - Notifications Module
 * Base URL: /api/notifications
 *
 * TODO Member 4:
 *  - GET    /api/notifications/user/{userId}          → User's notifications
 *  - GET    /api/notifications/user/{userId}/unread   → Unread count
 *  - PATCH  /api/notifications/{id}/read              → Mark single as read
 *  - PATCH  /api/notifications/user/{userId}/read-all → Mark all as read
 *  - DELETE /api/notifications/{id}                   → Delete notification
 * ================================================================
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class NotificationController {

    private final NotificationService notificationService;

    /** GET /api/notifications/user/{userId} - Get all notifications for user */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO.NotificationResponse>> getNotifications(@PathVariable String userId) {
        // TODO: Member 4 - Add pagination (Pageable)
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    /** GET /api/notifications/user/{userId}/unread - Get unread count */
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    /** PATCH /api/notifications/{id}/read - Mark a single notification as read */
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDTO.NotificationResponse> markAsRead(@PathVariable String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    /** PATCH /api/notifications/user/{userId}/read-all - Mark all as read */
    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }
}
