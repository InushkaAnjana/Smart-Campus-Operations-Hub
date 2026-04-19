/**
 * ================================================================
 * ProtectedRoute.jsx - Route Guard for Authenticated Pages
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth Module
 *
 * Redirects unauthenticated users to /login.
 * Wrap any route with <ProtectedRoute> to protect it.
 *
 * TODO Member 1:
 *  - Add role-based protection: <ProtectedRoute roles={['ADMIN']} />
 *  - Show "Access Denied" page for insufficient roles
 * ================================================================
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, hasRole } = useAuth()
  const location = useLocation()

  // Wait for auth state to load from localStorage
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen opacity-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in → redirect to login, preserve intended URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role check (if roles prop provided)
  if (roles && !hasRole(roles)) {
    // Show an access denied placeholder (or redirect to /unauthorized)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 mt-2">You don't have permission to view this page.</p>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
