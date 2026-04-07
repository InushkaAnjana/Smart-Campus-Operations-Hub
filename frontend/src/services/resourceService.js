/**
 * ================================================================
 * resourceService.js - Facilities & Resources API Calls
 * ================================================================
 * Owner: Member 3 - Facilities & Resources Module
 *
 * TODO Member 3:
 *  - Wire up each function to the correct backend endpoint
 *  - Add filter params to getResources (type, availability)
 *  - Add image upload support (multipart/form-data)
 * ================================================================
 */
import api from './axiosConfig'

const BASE = '/api/resources'

export const resourceService = {
  /** GET /api/resources */
  getAll: () => api.get(BASE).then(r => r.data),

  /** GET /api/resources/available */
  getAvailable: () => api.get(`${BASE}/available`).then(r => r.data),

  /** GET /api/resources/type/:type */
  getByType: (type) => api.get(`${BASE}/type/${type}`).then(r => r.data),

  /** GET /api/resources/:id */
  getById: (id) => api.get(`${BASE}/${id}`).then(r => r.data),

  /** POST /api/resources */
  create: (data) => api.post(BASE, data).then(r => r.data),

  /** PUT /api/resources/:id */
  update: (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data),

  /** DELETE /api/resources/:id */
  delete: (id) => api.delete(`${BASE}/${id}`),
}
