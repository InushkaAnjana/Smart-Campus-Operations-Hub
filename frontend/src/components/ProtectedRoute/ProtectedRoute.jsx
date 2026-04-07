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
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  // Wait for auth state to load from localStorage
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  // Not logged in → redirect to login, preserve intended URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role check (if roles prop provided)
  // TODO: Member 1 - Redirect to /unauthorized page for insufficient roles
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
