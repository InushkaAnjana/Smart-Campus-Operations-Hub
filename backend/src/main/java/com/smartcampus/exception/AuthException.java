package com.smartcampus.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * ================================================================
 * AuthException - Authentication & Authorization Errors
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth Module
 *
 * Thrown when:
 *  - Login fails due to invalid credentials
 *  - A registration attempt uses a role that is not in the Role enum
 *  - An email is already registered (duplicate registration)
 *  - A JWT token is malformed, expired, or blacklisted
 *  - A user attempts an action they are not authorized for
 *
 * HTTP STATUS:
 *  - Maps to 401 UNAUTHORIZED by default (via @ResponseStatus).
 *  - GlobalExceptionHandler overrides this for specific error codes:
 *      DUPLICATE_EMAIL → 409 Conflict
 *      INVALID_ROLE    → 400 Bad Request
 *
 * USAGE:
 *  throw new AuthException("Invalid credentials.", "INVALID_CREDENTIALS");
 *  throw new AuthException("Email already registered.", "DUPLICATE_EMAIL");
 *  throw new AuthException("Role 'SUPERUSER' is not valid.", "INVALID_ROLE");
 * ================================================================
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class AuthException extends RuntimeException {

    /** Machine-readable error code for structured error responses */
    private final String errorCode;

    /**
     * Constructs an AuthException with a user-facing message and a machine-readable error code.
     *
     * @param message   Human-readable error description (shown in API error response)
     * @param errorCode Machine-readable string code for client-side conditional handling
     */
    public AuthException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    /**
     * Constructs an AuthException with only a message.
     * Error code defaults to "AUTH_ERROR".
     */
    public AuthException(String message) {
        super(message);
        this.errorCode = "AUTH_ERROR";
    }

    public String getErrorCode() {
        return errorCode;
    }

    // ─── Named Factory Methods ──────────────────────────────────

    /** Invalid email or password during login */
    public static AuthException invalidCredentials() {
        return new AuthException("Invalid email or password.", "INVALID_CREDENTIALS");
    }

    /** Email is already associated with an existing account */
    public static AuthException duplicateEmail(String email) {
        return new AuthException("Email '" + email + "' is already registered.", "DUPLICATE_EMAIL");
    }

    /** Registration attempted with a role not in the Role enum */
    public static AuthException invalidRole(String role) {
        return new AuthException(
            "Role '" + role + "' is not valid. Accepted values: USER, ADMIN, TECHNICIAN.",
            "INVALID_ROLE"
        );
    }

    /** JWT token is expired or cannot be validated */
    public static AuthException tokenExpired() {
        return new AuthException("Session token has expired. Please log in again.", "TOKEN_EXPIRED");
    }
}
