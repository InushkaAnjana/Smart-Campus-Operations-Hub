package com.smartcampus.dto;

import com.smartcampus.model.Priority;
import com.smartcampus.model.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class TicketDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description is required")
        private String description;

        private Priority priority = Priority.MEDIUM;
        
        private String category;
        
        private String contactDetails;

        // One of resourceId or location must be given
        private String resourceId;
        private String location;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketUpdateRequest {
        private TicketStatus status;
        private Priority priority;
        private String technicianId;
        private String rejectReason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentDTO {
        @NotBlank(message = "Message is required")
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentResponse {
        private String id;
        private String userId;
        private String message;
        private LocalDateTime timestamp;
        private String userName; // helpful for frontend
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketResponse {
        private String id;
        private String title;
        private String description;
        private TicketStatus status;
        private Priority priority;
        private String category;
        private String contactDetails;
        private List<String> images;
        private String rejectReason;
        private String location;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime resolvedAt;

        private CreatorSummary createdBy;
        private CreatorSummary technician; // Assigned To
        private ResourceSummary resource;
        private List<CommentResponse> comments;
    }

    @Data
    @AllArgsConstructor
    public static class CreatorSummary {
        private String id;
        private String name;
        private String email;
    }

    @Data
    @AllArgsConstructor
    public static class ResourceSummary {
        private String id;
        private String name;
    }
}
