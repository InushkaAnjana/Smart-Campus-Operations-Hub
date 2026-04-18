package com.smartcampus.model;

/**
 * Ticket Status Workflow:
 * OPEN → IN_PROGRESS → RESOLVED → CLOSED
 * REJECTED (Set by ADMIN)
 */
public enum TicketStatus {
    OPEN,
    IN_PROGRESS,
    RESOLVED,
    CLOSED,
    REJECTED
}
