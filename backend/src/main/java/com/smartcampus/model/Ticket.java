package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Maintenance & Incident Ticket Document
 */
@Document(collection = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    private String id;

    @Indexed
    private String resourceId; // Optional: Specific asset
    
    private String location;   // Optional: General location if resourceId is null

    private String category;   // e.g., Electrical, Plumbing, IT

    private String description;

    private Priority priority;

    private TicketStatus status;

    private String contactDetails;

    private List<String> imageAttachments = new ArrayList<>();

    @Indexed
    private String createdById;

    @Indexed
    private String assignedToId; // Technician assigned

    private String rejectionReason;

    private List<Comment> comments = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = TicketStatus.OPEN;
        if (this.priority == null) this.priority = Priority.MEDIUM;
        if (this.imageAttachments == null) this.imageAttachments = new ArrayList<>();
        if (this.comments == null) this.comments = new ArrayList<>();
    }

    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
