package com.smartcampus.exception;

public class TicketException extends RuntimeException {

    private final String errorCode;

    public TicketException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
