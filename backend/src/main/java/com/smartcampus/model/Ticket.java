package com.smartcampus.model;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    private TicketStatus status;

    private Priority priority;

    private String category;
    
    private String contactDetails;

    private List<String> images; // Up to 3 images

    private String rejectReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    @Indexed
    private String createdById;

    @Indexed
    private String technicianId; // Assigned To

    @Indexed
    private String resourceId;
    
    private String location; // resourceId or location

    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = TicketStatus.OPEN;
        if (this.priority == null) this.priority = Priority.MEDIUM;
        if (this.images == null) this.images = new ArrayList<>();
        if (this.comments == null) this.comments = new ArrayList<>();
    }

    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
