/**
 * ================================================================
 * ProtectedRoute.jsx - Route Guard for Authenticated Pages
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth Module
 *
 * Usage patterns:
 *
 *   1. As a layout route wrapper (most common — used in App.jsx):
 *      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
 *        <Route path="/dashboard" element={<DashboardPage />} />
 *      </Route>
 *
 *   2. As a leaf-level wrapper for a specific role:
 *      <Route path="/admin" element={
 *        <ProtectedRoute roles={['ADMIN']}><AdminPage /></ProtectedRoute>
 *      } />
 *
 * Redirects unauthenticated users to /login, preserving the intended URL
 * in location state so LoginPage can redirect back after login.
 * ================================================================
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, hasRole } = useAuth()
  const location = useLocation()

  // Wait for auth state to load from localStorage before making any decisions
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen opacity-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in → redirect to login, preserve intended URL via state
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Optional role check (if roles prop provided)
  if (roles && !hasRole(roles)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 mt-2">You don't have permission to view this page.</p>
      </div>
    )
  }

  // Render children (which may include nested <Outlet /> from MainLayout)
  return children
}

export default ProtectedRoute
