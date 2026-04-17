package com.smartcampus.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * ================================================================
 * ResourceException — Domain Exception for Facilities & Assets Module
 * ================================================================
 * Thrown by ResourceService for business-rule violations specific
 * to resource management. Distinct from ResourceNotFoundException
 * (which is a 404) — this exception covers 400/409 scenarios such as:
 *
 *   DUPLICATE_NAME       → A resource with the same name already exists
 *   INVALID_TYPE         → Supplied type string is not a valid ResourceType
 *   INVALID_STATUS       → Supplied status string is not a valid ResourceStatus
 *   RESOURCE_IN_USE      → Cannot delete/deactivate a resource with active bookings
 *   CAPACITY_INVALID     → Capacity is ≤ 0
 *
 * HTTP Status: 409 CONFLICT (default via @ResponseStatus).
 * The GlobalExceptionHandler overrides this to 400 for
 * INVALID_TYPE, INVALID_STATUS, and CAPACITY_INVALID error codes.
 *
 * Usage:
 *   throw new ResourceException("DUPLICATE_NAME",
 *       "A resource named '" + name + "' already exists");
 * ================================================================
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class ResourceException extends RuntimeException {

    /** Machine-readable error code for switch-based HTTP status mapping */
    private final String errorCode;

    public ResourceException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
