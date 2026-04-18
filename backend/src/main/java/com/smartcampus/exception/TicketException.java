package com.smartcampus.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class TicketException extends RuntimeException {
    public TicketException(String message) {
        super(message);
    }
}
