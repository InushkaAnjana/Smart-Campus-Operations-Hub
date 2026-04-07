/**
 * ================================================================
 * notificationService.js - Notifications API Calls
 * ================================================================
 * Owner: Member 4 - Notifications Module
 *
 * TODO Member 4:
 *  - Wire up each function to the correct backend endpoint
 *  - Add WebSocket connection for real-time notifications
 *  - Add polling fallback if WebSocket is not available
 * ================================================================
 */
import api from './axiosConfig'

const BASE = '/api/notifications'

export const notificationService = {
  /** GET /api/notifications/user/:userId */
  getForUser: (userId) => api.get(`${BASE}/user/${userId}`).then(r => r.data),

  /** GET /api/notifications/user/:userId/unread */
  getUnreadCount: (userId) => api.get(`${BASE}/user/${userId}/unread`).then(r => r.data.unreadCount),

  /** PATCH /api/notifications/:id/read */
  markAsRead: (id) => api.patch(`${BASE}/${id}/read`).then(r => r.data),

  /** PATCH /api/notifications/user/:userId/read-all */
  markAllAsRead: (userId) => api.patch(`${BASE}/user/${userId}/read-all`),
}
