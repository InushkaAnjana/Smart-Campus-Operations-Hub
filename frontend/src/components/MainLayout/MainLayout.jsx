/**
 * ================================================================
 * MainLayout.jsx - Authenticated App Shell Layout
 * ================================================================
 * Owner: Member 1 (Team Lead)
 *
 * Wraps all authenticated pages with Sidebar + Topbar.
 * All protected pages render inside this layout.
 * ================================================================
 */
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Topbar from '../Topbar/Topbar'
import './MainLayout.css'

// Map route paths to readable page titles for the topbar
const PAGE_TITLES = {
  '/dashboard':     'Dashboard',
  '/resources':     'Facilities & Resources',
  '/bookings':      'Booking Management',
  '/tickets':       'Maintenance Tickets',
  '/notifications': 'Notifications',
}

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const pageTitle = PAGE_TITLES[location.pathname] || 'Smart Campus Hub'

  return (
    <div className="layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="layout-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="layout-main">
        <Topbar
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          pageTitle={pageTitle}
        />
        <main className="layout-content">
          {/* Authenticated route pages render here */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
