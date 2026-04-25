package com.smartcampus.dto;

import com.smartcampus.model.Priority;
import com.smartcampus.model.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating editable fields of an existing Ticket.
 * All fields are optional – only non-null values will be applied.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketUpdateDTO {
    private String category;
    private Priority priority;
    private TicketStatus status;
    private String assignedToId;
}
