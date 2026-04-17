/**
 * ================================================================
 * resourceService.js — Facilities & Assets API Layer
 * ================================================================
 * Owner: Member 3 - Facilities & Resources Module
 *
 * All functions return the response data directly (axios unwrapped).
 * Errors propagate to the caller for toast/alert handling.
 *
 * BASE: http://localhost:8081/api/resources
 *
 * FILTERING:
 *   getResources(filters) builds a query string from the filters
 *   object. Only non-empty keys are included so we never send
 *   ?type=&capacity= (which the backend would reject or ignore).
 *   Example: getResources({ type: 'ROOM', capacity: 50 })
 *     → GET /api/resources?type=ROOM&capacity=50
 * ================================================================
 */
import api from './axiosConfig'

const BASE = '/api/resources'

export const resourceService = {

  /**
   * GET /api/resources  — with optional filters
   * @param {Object} filters  { type, capacity, location, status }
   *   All keys are optional. Omit or pass null/empty to skip.
   */
  getResources: (filters = {}) => {
    // Build query params — skip null / empty-string values
    const params = {}
    if (filters.type)             params.type     = filters.type
    if (filters.capacity)         params.capacity = filters.capacity
    if (filters.location?.trim()) params.location = filters.location.trim()
    if (filters.status)           params.status   = filters.status

    return api.get(BASE, { params }).then(r => r.data)
  },

  /** GET /api/resources/available — resources where isAvailable=true */
  getAvailable: () => api.get(`${BASE}/available`).then(r => r.data),

  /** GET /api/resources/:id */
  getById: (id) => api.get(`${BASE}/${id}`).then(r => r.data),

  /**
   * POST /api/resources  — ADMIN only
   * @param {Object} data  ResourceRequestDTO shape
   */
  createResource: (data) => api.post(BASE, data).then(r => r.data),

  /**
   * PUT /api/resources/:id  — ADMIN only
   * @param {string} id   MongoDB resource id
   * @param {Object} data ResourceRequestDTO shape
   */
  updateResource: (id, data) => api.put(`${BASE}/${id}`, data).then(r => r.data),

  /**
   * DELETE /api/resources/:id  — ADMIN only
   * Returns void (204 No Content from backend).
   */
  deleteResource: (id) => api.delete(`${BASE}/${id}`),
}
