package com.smartcampus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * ================================================================
 * Auth DTOs - Request/Response objects for Authentication
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth Module
 *
 * TODO Member 1:
 *  - Add field validation annotations
 *  - LoginResponse already includes JWT token
 *  - Add refresh token support in AuthResponse
 * ================================================================
 */
public class AuthDTO {

    // ---- Login Request ----
    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    // ---- Register Request ----
    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private String role = "STUDENT"; // Default role
    }

    // ---- Auth Response (returned on login/register) ----
    @Data
    public static class AuthResponse {
        private String token;
        private String tokenType = "Bearer";
        private String userId;   // MongoDB ObjectId as String
        private String name;
        private String email;
        private String role;

        public AuthResponse(String token, String userId, String name, String email, String role) {
            this.token = token;
            this.userId = userId;
            this.name = name;
            this.email = email;
            this.role = role;
        }
    }
}
