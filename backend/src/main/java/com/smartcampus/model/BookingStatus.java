package com.smartcampus.model;

/**
 * BookingStatus Enum — Defines the full booking lifecycle.
 *
 * Allowed transitions (workflow enforcement):
 *   PENDING  → APPROVED    (admin approves)
 *   PENDING  → REJECTED    (admin rejects)
 *   APPROVED → CANCELLED   (user cancels their own, or admin cancels)
 *   PENDING  → CANCELLED   (user withdraws before admin acts)
 *   Any      → DELETED     (soft delete — admin only; preferred over hard delete)
 *
 * Why DELETED instead of hard delete?
 *   Soft delete preserves audit trail. Deleted bookings can be investigated
 *   later (e.g., billing disputes, abuse investigation) without losing data.
 *   Hard delete is irreversible and breaks foreign-key style references.
 *
 * Terminal states (no further transitions):
 *   REJECTED, CANCELLED, COMPLETED, DELETED
 */
public enum BookingStatus {
    PENDING,    // Just created — awaiting admin approval
    APPROVED,   // Admin approved — slot is confirmed & blocked
    REJECTED,   // Admin rejected — slot is free again
    CANCELLED,  // User or admin cancelled an approved/pending booking
    COMPLETED,  // Booking time window has passed (set by a scheduled job)
    DELETED     // Soft-deleted by admin — hidden from normal views
}
