package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

/**
 * ================================================================
 * Ticket Document (Maintenance & Issue Tracking) - MongoDB
 * ================================================================
 * Owner: Member 4 - Maintenance & Tickets Module
 *
 * TODO Member 4:
 *  - Add TicketStatus enum: OPEN, IN_PROGRESS, RESOLVED, CLOSED
 *  - Add priority levels: LOW, MEDIUM, HIGH, CRITICAL
 *  - Add assignment to staff member
 *  - Add comment/update thread per ticket
 *  - Add image attachments for issue reporting
 *  - Trigger notification to admin on new ticket creation
 * ================================================================
 */
@Document(collection = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    private String id; // MongoDB ObjectId stored as String

    @NotBlank
    private String title;

    private String description;

    // TODO: Member 4 - Replace with TicketStatus enum
    @lombok.Builder.Default
    private String status = "OPEN"; // OPEN | IN_PROGRESS | RESOLVED | CLOSED

    // TODO: Member 4 - Replace with Priority enum
    @lombok.Builder.Default
    private String priority = "MEDIUM"; // LOW | MEDIUM | HIGH | CRITICAL

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    // --- Relationships (stored as IDs in MongoDB) ---
    private String createdById; // ID of the user who reported the issue
    private String resourceId;  // ID of the resource/facility with the issue

    // TODO: Member 4 - Add staff assignee
    // private String assignedToId;

    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
