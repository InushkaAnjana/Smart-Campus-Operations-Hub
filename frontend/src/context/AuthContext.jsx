/**
 * ================================================================
 * AuthContext.jsx - Global Authentication State
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth Module
 *
 * Provides auth state (user, token, isAuthenticated) to the
 * entire app via React Context API.
 *
 * Usage:  const { user, login, logout } = useAuth()
 *
 * TODO Member 1:
 *  - Add token refresh logic on app load
 *  - Add role-based access helpers (isAdmin, isStaff)
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

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    const { token, ...userData } = data
    setUser(userData)
    setIsAuthenticated(true)
    return data
  }, [])

  const register = useCallback(async (name, email, password, role) => {
    const data = await authService.register(name, email, password, role)
    const { token, ...userData } = data
    setUser(userData)
    setIsAuthenticated(true)
    return data
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  // Helper role checks
  // TODO: Member 1 - Expand role checking as needed
  const isAdmin = user?.role === 'ADMIN'
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN'

  const value = {
    user,
    isAuthenticated,
    loading,
    isAdmin,
    isStaff,
    login,
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
