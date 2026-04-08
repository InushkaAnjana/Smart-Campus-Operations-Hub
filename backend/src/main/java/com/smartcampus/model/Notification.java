package com.smartcampus.model;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * ================================================================
 * Notification Document (MongoDB)
 * ================================================================
 * Types: BOOKING_PENDING | BOOKING_APPROVED | BOOKING_REJECTED |
 *        BOOKING_CANCELLED | TICKET_OPENED | TICKET_UPDATED | SYSTEM_ALERT
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

    private String title;

    private String message;

    private String type;

    private Boolean isRead;

    private LocalDateTime createdAt;

    @Indexed
    private String recipientId;

    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isRead == null) this.isRead = false;
    }
}
