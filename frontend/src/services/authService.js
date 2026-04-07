/**
 * ================================================================
 * authService.js - Authentication API Calls
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth Module
 *
 * TODO Member 1:
 *  - login()    → POST /api/auth/login
 *  - register() → POST /api/auth/register
 *  - getCurrentUser() → GET /api/auth/me
 *  - Store token and user in localStorage on success
 * ================================================================
 */
import api from './axiosConfig'

const AUTH_BASE = '/api/auth'

export const authService = {
  /**
   * Login with email + password
   * @returns { token, userId, name, email, role }
   */
  login: async (email, password) => {
    const response = await api.post(`${AUTH_BASE}/login`, { email, password })
    const { token, ...user } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    return response.data
  },

  /**
   * Register a new user account
   */
  register: async (name, email, password, role = 'STUDENT') => {
    const response = await api.post(`${AUTH_BASE}/register`, { name, email, password, role })
    const { token, ...user } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    return response.data
  },

  /**
   * Logout — clear localStorage
   */
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  /**
   * Get current user from localStorage (no API call)
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },
}
