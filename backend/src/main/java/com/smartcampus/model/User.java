package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

/**
 * ================================================================
 * User Document (MongoDB)
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth & Security Module
 *
 * TODO Member 1:
 *  - Add roles (ADMIN, STAFF, STUDENT) using @Enumerated
 *  - Wire up to Spring Security UserDetails
 *  - Add password encoding in service layer
 *  - Add profile picture URL field if needed
 * ================================================================
 */
@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id; // MongoDB ObjectId stored as String

    @NotBlank
    private String name;

    @Email
    @NotBlank
    @Indexed(unique = true)
    private String email;

    @NotBlank
    private String password; // Stored as BCrypt hash

    // TODO: Member 1 - Replace String role with proper Role enum
    private String role; // e.g., "ADMIN", "STAFF", "STUDENT"

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // --- Relationships (embedded or referenced by ID in MongoDB) ---
    // TODO: Member 2 - Reference bookings by userId in BookingRepository
    // TODO: Member 4 - Reference tickets by createdBy id in TicketRepository

    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
