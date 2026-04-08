package com.smartcampus.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * BookingException - Thrown for booking business rule violations.
 *
 * Examples:
 *  - Overlapping booking conflict
 *  - Invalid status transition (e.g., cannot approve a REJECTED booking)
 *  - Attempting to cancel a COMPLETED booking
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class BookingException extends RuntimeException {

    private final String errorCode;

    public BookingException(String message) {
        super(message);
        this.errorCode = "BOOKING_ERROR";
    }

    public BookingException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }

    // Convenience factory methods for common cases
    public static BookingException conflict(String resourceName, String startTime, String endTime) {
        return new BookingException(
            String.format("Resource '%s' is already booked between %s and %s.", resourceName, startTime, endTime),
            "BOOKING_CONFLICT"
        );
    }

    public static BookingException invalidTransition(String from, String to) {
        return new BookingException(
            String.format("Cannot transition booking from %s to %s.", from, to),
            "INVALID_STATUS_TRANSITION"
        );
    }

    public static BookingException unauthorized(String action) {
        return new BookingException(
            String.format("You are not authorized to %s this booking.", action),
            "BOOKING_UNAUTHORIZED"
        );
    }
}
