package com.smartcampus.dto;

import com.smartcampus.model.Priority;
import com.smartcampus.model.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponseDTO {
    private String id;
    private String resourceId;
    private String location;
    private String category;
    private String description;
    private Priority priority;
    private TicketStatus status;
    private String contactDetails;
    private List<String> imageAttachments;
    private String createdById;
    private String assignedToId;
    private String rejectionReason;
    private List<CommentDTO> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}
