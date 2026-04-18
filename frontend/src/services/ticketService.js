import api from './axiosConfig'

const BASE = '/api/tickets'

export const ticketService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status)
    if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority)
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo)
    return api.get(BASE, { params }).then(r => r.data)
  },

  getMyTickets: (userId) => api.get(`${BASE}/my`, { params: { userId } }).then(r => r.data),

  getById: (id) => api.get(`${BASE}/${id}`).then(r => r.data),

  create: (userId, ticketData, images) => {
    const formData = new FormData()
    // Append the JSON ticket info as a blob so Spring @RequestPart handles it
    formData.append('ticket', new Blob([JSON.stringify(ticketData)], { type: 'application/json' }))
    if (images && images.length > 0) {
      images.forEach(img => formData.append('images', img))
    }
    return api.post(BASE, formData, {
      params: { userId },
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data)
  },

  updateStatus: (id, userId, status, rejectReason = null) => 
    api.put(`${BASE}/${id}/status`, { status, rejectReason }, { params: { userId } }).then(r => r.data),

  assignTechnician: (id, technicianId) => 
    api.put(`${BASE}/${id}/assign`, { technicianId }).then(r => r.data),

  addComment: (id, userId, text) => 
    api.patch(`${BASE}/${id}/comment`, { text }, { params: { userId } }).then(r => r.data),

  deleteComment: (id, commentId, userId) => 
    api.delete(`${BASE}/${id}/comment/${commentId}`, { params: { userId } }).then(r => r.data),

  deleteTicket: (id) => api.delete(`${BASE}/${id}`).then(r => r.data),
}
