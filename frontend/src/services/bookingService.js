/**
 * ================================================================
 * bookingService.js - Booking Management API Calls
 * ================================================================
 * Owner: Member 2 - Booking Management Module
 *
 * TODO Member 2:
 *  - Wire up each function to the correct backend endpoint
 *  - Add availability check call before createBooking
 *  - Add calendar view data fetching (by date range)
 * ================================================================
 */
import api from './axiosConfig'

const BASE = '/api/bookings'

export const bookingService = {
  /** GET /api/bookings (Admin) */
  getAll: () => api.get(BASE).then(r => r.data),

  /** GET /api/bookings/:id */
  getById: (id) => api.get(`${BASE}/${id}`).then(r => r.data),

  /** GET /api/bookings/user/:userId */
  getByUser: (userId) => api.get(`${BASE}/user/${userId}`).then(r => r.data),

  /** GET /api/bookings/resource/:resourceId */
  getByResource: (resourceId) => api.get(`${BASE}/resource/${resourceId}`).then(r => r.data),

  /** POST /api/bookings?userId=xxx */
  create: (userId, bookingData) =>
    api.post(`${BASE}?userId=${userId}`, bookingData).then(r => r.data),

  /** PATCH /api/bookings/:id/status?status=xxx */
  updateStatus: (id, status) =>
    api.patch(`${BASE}/${id}/status?status=${status}`).then(r => r.data),

  /** DELETE /api/bookings/:id */
  cancel: (id) => api.delete(`${BASE}/${id}`),
}
