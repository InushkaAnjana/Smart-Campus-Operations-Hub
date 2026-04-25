import api from './axiosConfig'

const BASE = '/api/tickets'

/**
 * Maintenance & Incident Ticketing Service
 */
export const ticketService = {
  // Create ticket with images (Multipart)
  createTicket: (formData) => {
    return api.post(BASE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(r => r.data)
  },

  // Admin: Get all tickets with filters
  getAllTickets: (params) => api.get(BASE, { params }).then(r => r.data),

  // User: Get own tickets
  getMyTickets: () => api.get(`${BASE}/my`).then(r => r.data),

  // Get single ticket details
  getTicketById: (id) => api.get(`${BASE}/${id}`).then(r => r.data),

  // Update ticket status (Workflow)
  updateStatus: (id, status, reason = '') => 
    api.put(`${BASE}/${id}/status`, null, { params: { status, reason } }).then(r => r.data),

  // Assign technician
  assignTechnician: (id, technicianId) => 
    api.put(`${BASE}/${id}/assign`, null, { params: { technicianId } }).then(r => r.data),

  // Comments
  addComment: (id, comment) => api.patch(`${BASE}/${id}/comment`, comment).then(r => r.data),
  
  editComment: (id, index, message) => 
    api.put(`${BASE}/${id}/comment/${index}`, message, { headers: { 'Content-Type': 'text/plain' } }).then(r => r.data),
  
  deleteComment: (id, index) => api.delete(`${BASE}/${id}/comment/${index}`).then(r => r.data),

  // Update ticket fields (category, priority, status, assignedToId)
  updateTicket: (id, payload) => api.put(`${BASE}/${id}`, payload).then(r => r.data),

  // Delete ticket
  deleteTicket: (id) => api.delete(`${BASE}/${id}`).then(r => r.data),
}
