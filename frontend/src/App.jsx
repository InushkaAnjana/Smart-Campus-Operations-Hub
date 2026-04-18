/**
 * ================================================================
 * App.jsx - Application Root + React Router Configuration
 * ================================================================
 * Owner: Member 1 (Team Lead) - Routing & Auth Integration
 *
 * Route map:
 *   /              → redirect to /dashboard
 *   /login         → LoginPage (public)
 *   /register      → RegisterPage (public) - TODO: Member 1
 *   /dashboard     → DashboardPage (protected)
 *   /resources     → ResourcesPage (protected) - Member 3
 *   /bookings      → BookingsPage (protected)  - Member 2
 *   /tickets       → TicketsPage (protected)   - Member 4
 *   /notifications → NotificationsPage (protected) - Member 4
 *   *              → 404 NotFoundPage
 *
 * TODO Member 1:
 *  - Add /register route
 *  - Add admin-only routes under /admin/*
 *  - Add 404 NotFound page
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

          {/* TODO: Member 1 - Add register page */}
          {/* <Route path="/register" element={<RegisterPage />} /> */}

          {/* ---- Normal Routes (temporarily unprotected) ---- */}
          <Route
            element={
              <MainLayout />
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

            {/* TODO: Member 1 - Add admin routes
            <Route path="/admin/users" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminUsersPage />
              </ProtectedRoute>
            } /> */}
          </Route>

          {/* ---- 404 catch-all ---- */}
          {/* TODO: Member 1 - Create a proper NotFoundPage */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
