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
 * Owner: Member 4 - Notifications
 *
 * TODO Member 4:
 *  - Add NotificationType enum
 *  - Add bulk mark-as-read endpoint structure
 * ================================================================
 */
public class NotificationDTO {

    // ---- Notification Response ----
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationResponse {
        private String id;        // MongoDB ObjectId as String
        private String title;
        private String message;
        private String type;
        private Boolean isRead;
        private LocalDateTime createdAt;
    }
}
