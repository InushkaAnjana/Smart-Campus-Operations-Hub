/**
 * ================================================================
 * App.jsx - Application Root + React Router Configuration
 * ================================================================
 * Owner: Member 1 (Team Lead) - Routing & Auth Integration
 *
 * Route map:
 *   /              → redirect to /dashboard
 *   /login         → LoginPage (public)
 *   /register      → RegisterPage (public)
 *   /oauth/callback → OAuthCallback (public — handles Google redirect)
 *   /dashboard     → DashboardPage (protected)
 *   /resources     → ResourcesPage (protected) - Member 3
 *   /bookings      → BookingPage (protected)  - Member 2
 *   /tickets       → TicketsPage (protected)   - Member 4
 *   /tickets/my    → MyTickets (protected)
 *   /tickets/:id   → TicketDetails (protected)
 *   /notifications → NotificationsPage (protected) - Member 4
 *   *              → redirect to /dashboard
 * ================================================================
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import MainLayout from './components/MainLayout/MainLayout'

// Pages
import LoginPage        from './pages/Login/LoginPage'
import RegisterPage     from './pages/Register/RegisterPage'
import OAuthCallback    from './pages/Login/OAuthCallback'
import DashboardPage    from './pages/Dashboard/DashboardPage'
import ResourcesPage    from './pages/Resources/ResourcesPage'
import BookingPage      from './pages/Bookings/BookingPage'
import TicketsPage      from './pages/Tickets/TicketsPage'
import MyTickets        from './pages/Tickets/MyTickets'
import TicketDetails    from './pages/Tickets/TicketDetails'
import NotificationsPage from './pages/Notifications/NotificationsPage'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global toast notifications (used across all modules) */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          theme="dark"
        />

        <Routes>
          {/* ---- Public Routes ---- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* OAuthCallback must be public — it receives the token before auth is set */}
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          {/* ---- Protected Routes (require valid JWT) ---- */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Default: redirect / to /dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard - Member 1 */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Facilities & Resources - Member 3 */}
            <Route path="/resources" element={<ResourcesPage />} />

            {/* Booking Management - Member 2 */}
            <Route path="/bookings" element={<BookingPage />} />

            {/* Maintenance Tickets - Member 4 */}
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/my" element={<MyTickets />} />
            <Route path="/tickets/:id" element={<TicketDetails />} />

            {/* Notifications - Member 4 */}
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* ---- 404 catch-all ---- */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
