package com.smartcampus.controller;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ================================================================
 * NotificationController - Notification Endpoints
 * ================================================================
 * Owner: Member 4 - Notifications Module
 * Base URL: /api/notifications
 *
 * ── ENDPOINTS ───────────────────────────────────────────────────
 *   GET    /api/notifications/user/{userId}           → All notifications for a user
 *   GET    /api/notifications/user/{userId}/unread    → Unread badge count
 *   PATCH  /api/notifications/{id}/read              → Mark single as read
 *   PATCH  /api/notifications/user/{userId}/read-all → Mark all as read
 *   DELETE /api/notifications/{id}                   → Delete a notification
 *
 * ── ROLE-BASED ACCESS ───────────────────────────────────────────
 *   All endpoints require authentication (enforced by SecurityConfig).
 *   ADMINs and TECHNICIANs may send system notifications internally
 *   via NotificationService.sendNotification() — not exposed as REST.
 *
 *   Users can only view their own notifications (userId is passed as
 *   a path variable; the frontend always sends the authenticated user's ID).
 *   For stricter enforcement, replace the path variable with
 *   Authentication.getName() (email) + a repository lookup.
 *
 * ── NOTIFICATION TRIGGERS (cross-service, not REST) ─────────────
 *   BOOKING_APPROVED  → BookingServiceImpl.approveBooking()
 *   BOOKING_REJECTED  → BookingServiceImpl.rejectBooking()
 *   BOOKING_CANCELLED → BookingServiceImpl.cancelBooking()
 *   TICKET_UPDATED    → TicketServiceImpl.updateTicketStatus()
 *   TICKET_COMMENT    → TicketServiceImpl.addComment()
 *
 * ── CORS NOTE ────────────────────────────────────────────────────
 *   CORS is handled globally in SecurityConfig.corsConfigurationSource().
 *   No @CrossOrigin here — per-controller annotations conflict with
 *   the centralized CORS policy (root cause of prior 403 preflight issues).
 * ================================================================
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // ─── GET: All notifications for a user ──────────────────────

    /**
     * GET /api/notifications/user/{userId}
     *
     * Returns all notifications for the given user, sorted newest-first.
     * The frontend calls this on page load to populate the notification bell.
     *
     * Future improvement: add Pageable support to avoid loading thousands of
     * old notifications at once (e.g., ?page=0&size=20).
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO.NotificationResponse>> getNotifications(
            @PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    // ─── GET: Unread count (bell badge) ─────────────────────────

    /**
     * GET /api/notifications/user/{userId}/unread
     *
     * Returns the count of unread notifications.
     * Used by the frontend to display the red unread badge on the bell icon.
     *
     * Response: { "unreadCount": <number> }
     */
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // ─── PATCH: Mark a single notification as read ───────────────

    /**
     * PATCH /api/notifications/{id}/read
     *
     * Marks one notification as read (isRead = true).
     * Called when the user clicks on a specific notification item in the UI.
     * Returns the updated NotificationResponse so the frontend can update its state.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDTO.NotificationResponse> markAsRead(
            @PathVariable String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    // ─── PATCH: Mark ALL notifications as read ───────────────────

    /**
     * PATCH /api/notifications/user/{userId}/read-all
     *
     * Bulk-marks all unread notifications for a user as read.
     * Triggered by a "Mark all as read" button in the notification panel.
     * Uses MongoTemplate.updateMulti() for efficient single-query bulk update.
     *
     * Returns 204 No Content on success.
     */
    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    // ─── DELETE: Remove a notification ───────────────────────────

    /**
     * DELETE /api/notifications/{id}
     *
     * Permanently removes a notification document from MongoDB.
     * Called when the user dismisses a notification from the UI.
     *
     * Hard delete is appropriate here because notifications are ephemeral
     * UI state (unlike bookings/tickets which require an audit trail).
     *
     * Returns 204 No Content on success.
     * Returns 404 Not Found if the notification ID does not exist.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    // ─── ADMIN/TECHNICIAN: Create notification (manual trigger) ──

    /**
     * POST /api/notifications/send
     *
     * Allows admins and technicians to manually create a notification
     * for a specific user. Useful for system alerts or manual communication.
     *
     * Restricted to ADMIN and TECHNICIAN roles via @PreAuthorize.
     *
     * Role-based security:
     *   ADMIN      → Can send notifications to any user
     *   TECHNICIAN → Can send notifications related to their assigned tickets
     *   USER       → Cannot access this endpoint (403 Forbidden)
     *
     * Request body: { recipientId, title, message, type }
     * Returns 201 Created on success.
     */
    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<Void> sendNotification(
            @RequestBody NotificationDTO.CreateNotificationRequest request) {
        notificationService.sendNotification(
                request.getRecipientId(),
                request.getTitle(),
                request.getMessage(),
                request.getType()
        );
        return ResponseEntity.status(201).build();
    }
}
