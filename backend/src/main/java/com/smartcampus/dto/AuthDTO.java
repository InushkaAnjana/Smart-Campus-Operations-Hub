package com.smartcampus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * ================================================================
 * Auth DTOs - Request/Response objects for Authentication
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth Module
 *
 * DTOs included:
 * 1. LoginRequest → Credentials for POST /api/auth/login
 * 2. RegisterRequest → New user data for POST /api/auth/register
 * 3. AuthResponse → JWT + user info returned after login/register
 * 4. UserProfileResponse → Current user info returned by GET /api/auth/me
 *
 * JWT FLOW (documented here for reference):
 * 1. Client sends LoginRequest (email + password) to POST /api/auth/login
 * 2. AuthServiceImpl validates the credentials against the DB
 * 3. JwtUtils.generateToken(email, role) creates a signed HS256 JWT
 * 4. The JWT is returned inside AuthResponse.token
 * 5. Client stores the token (localStorage / sessionStorage)
 * 6. Client attaches the token as "Authorization: Bearer <token>" on each
 * request
 * 7. JwtAuthFilter intercepts, validates, and sets the SecurityContext
 * 8. Protected endpoints are resolved by Spring Security using the
 * SecurityContext
 * ================================================================
 */
public class AuthDTO {

    // ─── Login ─────────────────────────────────────────────────

    /**
     * Payload for POST /api/auth/login.
     * Validated via @Valid in AuthController.
     */
    @Data
    public static class LoginRequest {

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    // ─── Register ──────────────────────────────────────────────

    /**
     * Payload for POST /api/auth/register.
     *
     * Role validation:
     * The regex below restricts accepted values to USER | ADMIN | TECHNICIAN.
     * Any other value will be rejected with a 422 Unprocessable Entity before
     * the service layer is even reached. This is a first-pass guard;
     * AuthServiceImpl also validates against the Role enum for belt-and-suspenders.
     */
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

        /**
         * Role must be one of USER | ADMIN | TECHNICIAN (case-sensitive).
         * Defaults to USER if not provided.
         * Validated at field-level by @Pattern and also in AuthServiceImpl.
         */
        @Pattern(regexp = "^(USER|ADMIN|TECHNICIAN)$", message = "Role must be one of: USER, ADMIN, TECHNICIAN")
        private String role = "USER";
    }

    // ─── Auth Response ─────────────────────────────────────────

    /**
     * Returned by both POST /api/auth/login and POST /api/auth/register.
     *
     * The 'token' field holds the signed JWT.
     * The client should send it as: Authorization: Bearer <token>
     *
     * 'tokenType' is always "Bearer" (OAuth2 convention).
     * 'expiresIn' indicates token validity in seconds (matches
     * app.jwt.expiration-ms / 1000).
     */
    @Data
    public static class AuthResponse {
        private String token;
        private String tokenType = "Bearer";
        private long expiresIn; // Token validity in seconds
        private String userId; // MongoDB ObjectId as String
        private String name;
        private String email;
        private String role; // "USER" | "ADMIN" | "TECHNICIAN"

        public AuthResponse(String token, long expiresIn,
                String userId, String name, String email, String role) {
            this.token = token;
            this.expiresIn = expiresIn;
            this.userId = userId;
            this.name = name;
            this.email = email;
            this.role = role;
        }
    }

    // ─── User Profile (GET /api/auth/me) ───────────────────────

    /**
     * Returned by GET /api/auth/me.
     * Contains the authenticated user's profile data (no password, no token).
     */
    @Data
    public static class UserProfileResponse {
        private String id;
        private String name;
        private String email;
        private String role;

        public UserProfileResponse(String id, String name, String email, String role) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
        }
    }

    // ─── OAuth Placeholder ─────────────────────────────────────

    /**
     * Placeholder payload for POST /api/auth/oauth/google.
     * Simulates Google OAuth login by accepting an ID token.
     *
     * FUTURE IMPLEMENTATION NOTE:
     * Replace this stub with actual Google token verification:
     * 1. Verify idToken using Google's tokeninfo endpoint or OAuth2 library
     * 2. Extract email, name from the verified payload
     * 3. Upsert the user in MongoDB (create if not exists)
     * 4. Return a JWT via the standard AuthResponse
     */
    @Data
    public static class GoogleOAuthRequest {
        @NotBlank(message = "Google ID token is required")
        private String idToken;
    }
}
