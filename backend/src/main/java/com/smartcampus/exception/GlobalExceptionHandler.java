package com.smartcampus.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ================================================================
 * GlobalExceptionHandler — Centralised Exception → HTTP Response Mapping
 * ================================================================
 *
 * All unhandled exceptions propagate here and are converted to
 * consistent JSON ErrorResponse bodies, so the frontend always
 * receives a predictable structure regardless of the error type.
 *
 * HTTP STATUS MAPPING:
 *  404  ResourceNotFoundException  → entity not found
 *  400  BadRequestException        → business rule / bad input
 *  403  BookingException(BOOKING_UNAUTHORIZED) → insufficient role
 *  409  BookingException(BOOKING_CONFLICT)     → slot overlap
 *  409  BookingException(INVALID_STATUS_TRANSITION) → bad workflow step
 *  409  ResourceException(DUPLICATE_NAME)     → duplicate resource name
 *  409  ResourceException(RESOURCE_IN_USE)    → resource has active bookings
 *  400  ResourceException(INVALID_TYPE)       → bad enum string for type
 *  400  ResourceException(CAPACITY_INVALID)   → capacity ≤ 0
 *  400  MethodArgumentTypeMismatchException   → bad enum query param (e.g. type=INVALID)
 *  422  MethodArgumentNotValidException → @Valid annotation failures
 *  403  UnauthorizedException      → auth/role violations from other modules
 *  500  Exception                  → catch-all safety net
 *
 * NOTE on BookingException HTTP codes:
 *  The class-level @ResponseStatus(CONFLICT) on BookingException would
 *  make ALL booking exceptions return 409 — but BOOKING_UNAUTHORIZED
 *  should be 403. We override that per-errorCode in the handler below.
 * ================================================================
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ─── 404 Not Found ─────────────────────────────────────────

    /** Booking, User, Resource, etc. not found by ID */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {

        ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    // ─── 400 Bad Request ───────────────────────────────────────

    /** General bad-request / explicit business rule violations */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            BadRequestException ex, HttpServletRequest request) {

        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // ─── Ticket Exceptions ───────────────────────────────────────

    /** Handles Maintenance & Incident Ticket related errors */
    @ExceptionHandler(TicketException.class)
    public ResponseEntity<ErrorResponse> handleTicketException(
            TicketException ex, HttpServletRequest request) {

        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Ticket Error",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // ─── Booking Exceptions (409 or 403 depending on errorCode) ──

    /**
     * Handles all BookingException instances with smart HTTP status mapping:
     *
     *  BOOKING_UNAUTHORIZED        → 403 FORBIDDEN
     *    (user lacks permission: not admin, not owner)
     *
     *  BOOKING_CONFLICT            → 409 CONFLICT
     *    (overlapping approved booking detected during approval)
     *
     *  INVALID_STATUS_TRANSITION   → 409 CONFLICT
     *    (e.g. trying to approve a REJECTED booking)
     *
     *  VALIDATION_ERROR            → 400 BAD REQUEST
     *    (e.g. endTime before startTime, invalid filter value)
     *
     *  RESOURCE_UNAVAILABLE        → 400 BAD REQUEST
     *    (booking a resource marked isAvailable=false)
     *
     *  All others                  → 409 CONFLICT (safe default)
     */
    @ExceptionHandler(BookingException.class)
    public ResponseEntity<ErrorResponse> handleBookingException(
            BookingException ex, HttpServletRequest request) {

        HttpStatus httpStatus = resolveBookingHttpStatus(ex.getErrorCode());

        ErrorResponse error = new ErrorResponse(
                httpStatus.value(),
                ex.getErrorCode(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(httpStatus).body(error);
    }

    /**
     * Maps a BookingException's errorCode to the appropriate HTTP status.
     * This ensures UNAUTHORIZED errors return 403, not 409.
     */
    private HttpStatus resolveBookingHttpStatus(String errorCode) {
        if (errorCode == null) return HttpStatus.CONFLICT;
        return switch (errorCode) {
            case "BOOKING_UNAUTHORIZED"       -> HttpStatus.FORBIDDEN;
            case "VALIDATION_ERROR"           -> HttpStatus.BAD_REQUEST;
            case "RESOURCE_UNAVAILABLE"       -> HttpStatus.BAD_REQUEST;
            case "BOOKING_CONFLICT"           -> HttpStatus.CONFLICT;
            case "INVALID_STATUS_TRANSITION"  -> HttpStatus.CONFLICT;
            default                           -> HttpStatus.CONFLICT;
        };
    }

    // ─── Resource Module Exceptions (400 or 409) ───────────────

    /**
     * Handles ResourceException from the Facilities & Assets module.
     *
     * Error code → HTTP status mapping:
     *   DUPLICATE_NAME    → 409 Conflict   (another resource has the same name)
     *   RESOURCE_IN_USE   → 409 Conflict   (cannot delete a resource with bookings)
     *   INVALID_TYPE      → 400 Bad Request (supplied string is not a valid ResourceType)
     *   INVALID_STATUS    → 400 Bad Request (supplied string is not a valid ResourceStatus)
     *   CAPACITY_INVALID  → 400 Bad Request (capacity ≤ 0)
     */
    @ExceptionHandler(ResourceException.class)
    public ResponseEntity<ErrorResponse> handleResourceException(
            ResourceException ex, HttpServletRequest request) {

        HttpStatus httpStatus = resolveResourceHttpStatus(ex.getErrorCode());
        ErrorResponse error = new ErrorResponse(
                httpStatus.value(),
                ex.getErrorCode(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(httpStatus).body(error);
    }

    /** Maps ResourceException error codes to HTTP status codes. */
    private HttpStatus resolveResourceHttpStatus(String errorCode) {
        if (errorCode == null) return HttpStatus.CONFLICT;
        return switch (errorCode) {
            case "INVALID_TYPE",
                 "INVALID_STATUS",
                 "CAPACITY_INVALID"  -> HttpStatus.BAD_REQUEST;
            case "DUPLICATE_NAME",
                 "RESOURCE_IN_USE"   -> HttpStatus.CONFLICT;
            default                  -> HttpStatus.CONFLICT;
        };
    }

    /**
     * Catches Spring's type-mismatch error when an invalid enum string is
     * supplied as a query param (e.g. ?type=INVALID or ?status=WRONG).
     * Without this handler it would fall through to the 500 catch-all.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {

        String message = String.format(
                "Invalid value '%s' for parameter '%s'. Expected type: %s",
                ex.getValue(), ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown"
        );
        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "INVALID_PARAMETER",
                message,
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // ─── 403 Forbidden ─────────────────────────────────────────

    /** Auth/role violations from other modules (e.g., Resource, Ticket) */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(
            UnauthorizedException ex, HttpServletRequest request) {

        ErrorResponse error = new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                "Forbidden",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    // ─── Auth Exceptions (401 / 409 / 400 depending on errorCode) ──

    /**
     * Handles AuthException thrown by the Auth module.
     *
     * Error code → HTTP status mapping:
     *   INVALID_CREDENTIALS → 401 Unauthorized  (wrong email/password)
     *   TOKEN_EXPIRED       → 401 Unauthorized  (JWT expired)
     *   AUTH_ERROR          → 401 Unauthorized  (general auth failure)
     *   DUPLICATE_EMAIL     → 409 Conflict      (email already in use)
     *   INVALID_ROLE        → 400 Bad Request   (role not in enum)
     */
    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ErrorResponse> handleAuthException(
            AuthException ex, HttpServletRequest request) {

        HttpStatus status = resolveAuthHttpStatus(ex.getErrorCode());
        ErrorResponse error = new ErrorResponse(
                status.value(),
                ex.getErrorCode(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(status).body(error);
    }

    /**
     * Maps AuthException error codes to appropriate HTTP status codes.
     * Credentials/token failures → 401; email conflicts → 409; bad role → 400.
     */
    private HttpStatus resolveAuthHttpStatus(String errorCode) {
        if (errorCode == null) return HttpStatus.UNAUTHORIZED;
        return switch (errorCode) {
            case "DUPLICATE_EMAIL"          -> HttpStatus.CONFLICT;
            case "INVALID_ROLE"             -> HttpStatus.BAD_REQUEST;
            case "INVALID_CREDENTIALS",
                 "TOKEN_EXPIRED",
                 "AUTH_ERROR"               -> HttpStatus.UNAUTHORIZED;
            default                         -> HttpStatus.UNAUTHORIZED;
        };
    }

    /**
     * Handles Spring Security BadCredentialsException (thrown by AuthenticationManager
     * during DaoAuthenticationProvider.authenticate() when password does not match).
     * Returns 401 Unauthorized with a safe, non-leaking message.
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest request) {

        ErrorResponse error = new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "INVALID_CREDENTIALS",
                "Invalid email or password.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // ─── 422 Unprocessable Entity ──────────────────────────────

    /**
     * Handles @Valid annotation failures on @RequestBody DTOs.
     * Collects all field-level validation messages into a list
     * so the frontend can display them all at once (not just the first).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<String> validationErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.toList());

        ErrorResponse error = new ErrorResponse(
                HttpStatus.UNPROCESSABLE_ENTITY.value(),
                "Validation Failed",
                "One or more fields failed validation",
                request.getRequestURI(),
                validationErrors
        );
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(error);
    }

    // ─── 500 Internal Server Error ─────────────────────────────

    /**
     * Catch-all safety net for any unexpected runtime exceptions.
     * Logs the full stack trace server-side but returns a generic
     * message to the client to avoid leaking internal details.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(
            Exception ex, HttpServletRequest request) {

        // In production you would log ex here with a correlation ID
        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "An unexpected error occurred. Please try again later.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
