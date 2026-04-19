/**
 * ================================================================
 * axiosConfig.js - Axios HTTP Client Configuration
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth / API Infrastructure
 *
 * This is the BASE axios instance used by all service files.
 * All API calls MUST go through this instance — not raw axios.
 *
 * TODO Member 1:
 *  - JWT token is auto-attached via request interceptor
 *  - 401 responses auto-redirect to /login
 *  - Update BASE_URL for production deployment
 * ================================================================
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
})

// ---- Request Interceptor: Attach JWT token ----
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ---- Response Interceptor: Handle global errors ----
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid → clear storage and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    // Return a clean error message for service layer to handle
    return Promise.reject(error.response?.data || error)
  }
)

export default axiosInstance
