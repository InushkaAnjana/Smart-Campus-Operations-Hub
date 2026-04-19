package com.smartcampus.model;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Setter;
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
 * FIELD NOTES:
 *  - id         : MongoDB auto-generated ObjectId (String representation)
 *  - name       : Display name of the user
 *  - email      : Unique login identifier; indexed for fast lookup
 *  - password   : BCrypt-encoded password; NEVER stored in plain text
 *  - role       : One of Role.USER | Role.ADMIN | Role.TECHNICIAN
 *                 Stored as a string in MongoDB ("USER", "ADMIN", "TECHNICIAN")
 *  - createdAt  : Timestamp when the user document was first created
 *  - updatedAt  : Timestamp of the most recent update
 *
 * PASSWORD SECURITY:
 *  BCrypt is used (work factor 10 by default in Spring Security).
 *  The raw password is NEVER persisted — only the encoded hash.
 *
 * ROLE ENFORCEMENT:
 *  The role field is validated in AuthServiceImpl during registration.
 *  Only values matching the Role enum are accepted.
 *  Spring Security reads this role and prepends "ROLE_" to create
 *  a GrantedAuthority (e.g., "ROLE_ADMIN") for @PreAuthorize checks.
 * ================================================================
 */
@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    @NotBlank
    private String name;

    @Email
    @NotBlank
    @Indexed(unique = true)  // Enforces email uniqueness at the DB level
    private String email;

    @NotBlank
    private String password; // BCrypt-encoded; raw password is NEVER stored

    /**
     * Role stored as a String in MongoDB (e.g. "USER", "ADMIN", "TECHNICIAN").
     * Validated against the Role enum during registration in AuthServiceImpl.
     * Spring Security maps this to ROLE_<role> for authorization decisions.
     */
    private String role;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Called manually before the first save (MongoDB lacks @PrePersist).
     * Sets both createdAt and updatedAt to the current timestamp.
     */
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * Called manually before any subsequent save.
     * Updates the updatedAt timestamp to reflect the current modification time.
     */
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
