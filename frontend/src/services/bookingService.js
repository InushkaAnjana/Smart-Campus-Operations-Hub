/**
 * ================================================================
 * bookingService.js — Booking Management API Layer
 * ================================================================
 * Wraps every backend endpoint defined in BookingController.java.
 *
 * Endpoint map (from BookingController):
 *   POST   /api/bookings                  → createBooking()
 *   GET    /api/bookings?status&resourceId&userId&date → getAllBookings(filters)
 *   GET    /api/bookings/my               → getMyBookings()
 *   GET    /api/bookings/:id              → getById()
 *   PUT    /api/bookings/:id/approve      → approveBooking()
 *   PUT    /api/bookings/:id/reject       → rejectBooking(id, note)
 *   PUT    /api/bookings/:id/cancel       → cancelBooking()
 *   DELETE /api/bookings/:id              → deleteBooking()
 * ================================================================
 */
import api from './axiosConfig'

const BASE = '/api/bookings'

export const bookingService = {
  // ── CREATE ────────────────────────────────────────────────────
  /**
   * Create a new PENDING booking.
   * Body: { resourceId, startTime, endTime, purpose, attendeeCount }
   * startTime/endTime must be ISO-8601 LocalDateTime strings.
   */
  createBooking: (data) =>
    api.post(BASE, data).then(r => r.data),

  // ── READ (ADMIN — with optional filters) ──────────────────────
  /**
   * Get all bookings (ADMIN only).
   * Filters: { status, resourceId, userId, date }  — all optional.
   * date must be "YYYY-MM-DD" string when provided.
   */
  getAllBookings: (filters = {}) => {
    // Build query string from non-null filter values
    const params = new URLSearchParams()
    if (filters.status)     params.append('status',     filters.status)
    if (filters.resourceId) params.append('resourceId', filters.resourceId)
    if (filters.userId)     params.append('userId',     filters.userId)
    if (filters.date)       params.append('date',       filters.date)
    return api.get(`${BASE}?${params.toString()}`).then(r => r.data)
  },

  // ── READ (USER — own bookings) ────────────────────────────────
  /**
   * Get the authenticated user's own bookings.
   * Backend resolves userId from JWT — no param needed.
   */
  getMyBookings: () =>
    api.get(`${BASE}/my`).then(r => r.data),

  /** Get a single booking by ID */
  getById: (id) =>
    api.get(`${BASE}/${id}`).then(r => r.data),

  // ── WORKFLOW ACTIONS ──────────────────────────────────────────
  /**
   * Approve a PENDING booking (ADMIN only).
   * Runs conflict detection on the backend.
   * note is optional admin comment.
   */
  approveBooking: (id, note = '') =>
    api.put(`${BASE}/${id}/approve`, { note }).then(r => r.data),

  /**
   * Reject a PENDING booking (ADMIN only).
   * note is the rejection reason shown to the user.
   */
  rejectBooking: (id, note = '') =>
    api.put(`${BASE}/${id}/reject`, { note }).then(r => r.data),

  /**
   * Cancel a booking.
   * Owners can cancel PENDING or APPROVED bookings.
   * ADMIN can cancel any non-terminal booking.
   */
  cancelBooking: (id) =>
    api.put(`${BASE}/${id}/cancel`).then(r => r.data),

  // ── DELETE (ADMIN — soft-delete) ──────────────────────────────
  /**
   * Soft-delete a booking (ADMIN only).
   * Sets status=DELETED + records deletedAt; document stays in DB.
   */
  deleteBooking: (id) =>
    api.delete(`${BASE}/${id}`).then(r => r.data),
}
