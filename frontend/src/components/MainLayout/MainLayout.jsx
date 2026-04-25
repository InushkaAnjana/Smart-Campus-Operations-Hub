/**
 * MainLayout.jsx - Authenticated App Shell Layout (Modern Tailwind UI)
 */
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Topbar from '../Topbar/Topbar'

const PAGE_TITLES = {
  '/dashboard':     'Dashboard',
  '/resources':     'Facilities & Resources',
  '/bookings':      'Booking Management',
  '/tickets':       'Maintenance Tickets',
  '/notifications': 'Notifications',
  '/users':         'User Management',
}

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const pageTitle = PAGE_TITLES[location.pathname] || 'Smart Campus Hub'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar — always visible on lg+, slide-in on mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          pageTitle={pageTitle}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
