package com.smartcampus.dto;

import com.smartcampus.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new Ticket
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequestDTO {
    
    private String resourceId;
    
    private String location;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private Priority priority;

    @NotBlank(message = "Contact details are required")
    private String contactDetails;
}
