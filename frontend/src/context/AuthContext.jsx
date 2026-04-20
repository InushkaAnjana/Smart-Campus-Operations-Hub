/**
 * ================================================================
 * AuthContext.jsx - Global Authentication State
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth Module
 *
 * Provides auth state (user, token, isAuthenticated) to the
 * entire app via React Context API.
 *
 * Usage:  const { user, login, logout, isAdmin, loginWithToken } = useAuth()
 *
 * JWT Handling Details:
 *  - Tokens are stored in localStorage as 'token' upon successful login/register.
 *  - On app load, `useEffect` checks for 'token' and restores user state.
 *  - The interceptor in `axiosConfig.js` automatically attaches this token
 *    as an `Authorization: Bearer <token>` header to all outgoing API requests.
 *  - On manual logout or a 401 response intercept, the token is destroyed.
 *
 * OAuth2 Flow:
 *  - After Google OAuth, OAuthCallback.jsx receives the JWT as a query param.
 *  - It calls loginWithToken(token, userData) which stores the token in
 *    localStorage AND updates the React state so ProtectedRoutes work
 *    immediately without needing a full page reload.
 *
 * Role-Based Rendering:
 *  - User objects contain a `role` field (e.g. 'ADMIN', 'USER', 'TECHNICIAN').
 *  - `isAdmin` boolean simplifies admin-only UI checks (e.g. showing users page).
 *  - Use to protect layouts, routes, or toggle feature visibility.
 * ================================================================
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // On app load, restore user from localStorage
  useEffect(() => {
    const savedUser = authService.getCurrentUser()
    const token = localStorage.getItem('token')
    if (savedUser && token) {
      setUser(savedUser)
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  /**
   * Standard login with email + password.
   * Calls POST /api/auth/login, stores token in localStorage via authService,
   * and updates React state.
   */
  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    const { token, ...userData } = data
    setUser(userData)
    setIsAuthenticated(true)
    return data
  }, [])

  /**
   * OAuth2 login shortcut — called by OAuthCallback after extracting the JWT
   * from the query parameter. Stores the token and user in localStorage and
   * updates the in-memory React state so that ProtectedRoute works immediately
   * without a full page reload.
   *
   * @param {string} token    - The JWT received from the backend via redirect
   * @param {object} userData - User info decoded from JWT payload
   */
  const loginWithToken = useCallback((token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  /**
   * Register a new account.
   * Calls POST /api/auth/register and logs the user in immediately.
   */
  const register = useCallback(async (name, email, password, role) => {
    const data = await authService.register(name, email, password, role)
    const { token, ...userData } = data
    setUser(userData)
    setIsAuthenticated(true)
    return data
  }, [])

  /**
   * Logout — clears localStorage and resets React state.
   */
  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  // Helper role checks
  const isAdmin = user?.role === 'ADMIN'
  const isTechnician = user?.role === 'TECHNICIAN'

  // A generic wrapper for checking multiple roles
  const hasRole = useCallback((roles) => {
    if (!user) return false
    return roles.includes(user.role)
  }, [user])

  const value = {
    user,
    isAuthenticated,
    loading,
    isAdmin,
    isTechnician,
    hasRole,
    login,
    loginWithToken,  // ← used by OAuthCallback
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export default AuthContext
