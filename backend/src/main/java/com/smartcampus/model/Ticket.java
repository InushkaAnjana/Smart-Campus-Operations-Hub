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
 * Ticket Document (Maintenance & Issue Tracking) - MongoDB
 * ================================================================
 * Status flow: OPEN → IN_PROGRESS → RESOLVED → CLOSED
 * Priority levels: LOW | MEDIUM | HIGH | CRITICAL
 * ================================================================
 */
@Document(collection = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    private String id;

    private String title;

    private String description;

    private String status; // OPEN | IN_PROGRESS | RESOLVED | CLOSED

    private String priority; // LOW | MEDIUM | HIGH | CRITICAL

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    @Indexed
    private String createdById;

    @Indexed
    private String resourceId;

    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = "OPEN";
        if (this.priority == null) this.priority = "MEDIUM";
    }

    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
