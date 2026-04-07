/**
 * ================================================================
 * ticketService.js - Maintenance Tickets API Calls
 * ================================================================
 * Owner: Member 4 - Maintenance & Tickets Module
 *
 * TODO Member 4:
 *  - Wire up each function to the correct backend endpoint
 *  - Add file upload support for ticket attachments
 *  - Add getStats() for dashboard statistics
 * ================================================================
 */
import api from './axiosConfig'

const BASE = '/api/tickets'

export const ticketService = {
  /** GET /api/tickets (Admin/Staff) */
  getAll: () => api.get(BASE).then(r => r.data),

  /** GET /api/tickets/:id */
  getById: (id) => api.get(`${BASE}/${id}`).then(r => r.data),

  /** GET /api/tickets/user/:userId */
  getByUser: (userId) => api.get(`${BASE}/user/${userId}`).then(r => r.data),

  /** GET /api/tickets/status/:status */
  getByStatus: (status) => api.get(`${BASE}/status/${status}`).then(r => r.data),

  /** POST /api/tickets?userId=xxx */
  create: (userId, ticketData) =>
    api.post(`${BASE}?userId=${userId}`, ticketData).then(r => r.data),

  /** PUT /api/tickets/:id */
  update: (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data),

  /** DELETE /api/tickets/:id */
  close: (id) => api.delete(`${BASE}/${id}`),
}
