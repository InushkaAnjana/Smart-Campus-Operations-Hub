package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    private String userId;
    private String userName; // To avoid frequent lookups
    private String message;
    private LocalDateTime timestamp;
}
