package com.smartcampus.exception;

import com.smartcampus.exception.BookingException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ================================================================
 * GlobalExceptionHandler - Centralized Exception Handling
 * ================================================================
 * Owner: Member 1 (Team Lead)
 *
 * All unhandled exceptions bubble up here.
 * Returns consistent JSON error responses to the frontend.
 *
 * TODO: All Members - Add module-specific exceptions here as needed
 *      (e.g., BookingConflictException, TicketAlreadyClosedException)
 * ================================================================
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Handle 404 - Entity not found */
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

    /** Handle 400 - Bad request / business rule violations */
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

    /** Handle 409 - Booking conflicts and invalid status transitions */
    @ExceptionHandler(BookingException.class)
    public ResponseEntity<ErrorResponse> handleBookingException(
            BookingException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                ex.getErrorCode(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /** Handle 403 - Unauthorized access */
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

    /** Handle 422 - Validation errors from @Valid */
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

    /** Handle 500 - Catch-all for unexpected errors */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(
            Exception ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "An unexpected error occurred. Please try again.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
