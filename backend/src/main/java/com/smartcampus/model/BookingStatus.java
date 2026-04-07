package com.smartcampus.model;

/**
 * BookingStatus Enum - Defines the full booking lifecycle.
 *
 * Allowed transitions:
 *   PENDING  → APPROVED
 *   PENDING  → REJECTED
 *   APPROVED → CANCELLED
 *
 * Terminal states (no further transitions):
 *   REJECTED, CANCELLED, COMPLETED
 */
public enum BookingStatus {
    PENDING,    // Just created — awaiting admin approval
    APPROVED,   // Admin approved — slot is confirmed & blocked
    REJECTED,   // Admin rejected — slot is free again
    CANCELLED,  // User or admin cancelled an approved booking
    COMPLETED   // Booking time window has passed (can be set by a scheduled job)
}
