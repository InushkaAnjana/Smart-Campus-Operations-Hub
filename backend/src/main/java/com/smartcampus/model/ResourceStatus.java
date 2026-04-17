package com.smartcampus.model;

/**
 * ================================================================
 * ResourceStatus — Enum for Campus Resource Operational State
 * ================================================================
 * ACTIVE          → Resource is operational and available for booking
 * OUT_OF_SERVICE  → Resource is broken, under maintenance, or retired
 *
 * Role-based rules:
 *   - Only ADMIN can change status to OUT_OF_SERVICE
 *   - USER/STAFF can only view resources; filtering by status is allowed
 * ================================================================
 */
public enum ResourceStatus {

    /**
     * Resource is operational.
     * This is the default state when a resource is first created.
     */
    ACTIVE,

    /**
     * Resource is unavailable for use (e.g., under maintenance,
     * broken, or decommissioned). Booking this resource should be
     * rejected by the BookingService.
     */
    OUT_OF_SERVICE
}
