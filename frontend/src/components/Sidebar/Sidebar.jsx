/**
 * ================================================================
 * Sidebar.jsx - Main Navigation Sidebar
 * ================================================================
 * Owner: Member 1 (Team Lead) - Layout / Navigation
 *
 * TODO Member 1:
 *  - Add active link highlighting
 *  - Add role-based nav visibility (hide admin links for students)
 *  - Add mobile drawer/hamburger menu support
 * ================================================================
 */
import { NavLink, useNavigate } from 'react-router-dom'
import {
  MdDashboard,
  MdMeetingRoom,
  MdEventNote,
  MdBuild,
  MdNotifications,
  MdLogout,
  MdSettings,
  MdSchool,
} from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <MdDashboard />,
    description: 'Overview & stats',
  },
  {
    label: 'Resources',
    path: '/resources',
    icon: <MdMeetingRoom />,
    description: 'Facilities & Rooms',
    // Owner: Member 3
  },
  {
    label: 'Bookings',
    path: '/bookings',
    icon: <MdEventNote />,
    description: 'Manage reservations',
    // Owner: Member 2
  },
  {
    label: 'Tickets',
    path: '/tickets',
    icon: <MdBuild />,
    description: 'Maintenance issues',
    // Owner: Member 4
  },
  {
    label: 'Notifications',
    path: '/notifications',
    icon: <MdNotifications />,
    description: 'Alerts & updates',
    // Owner: Member 4
  },
]

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      {/* Logo / Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <MdSchool />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">SmartCampus</span>
          <span className="sidebar-brand-sub">Operations Hub</span>
        </div>
      </div>

      {/* User Info */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{user?.name || 'Guest'}</span>
          <span className="sidebar-user-role">{user?.role || 'USER'}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <p className="sidebar-nav-label">Main Menu</p>
        <ul className="sidebar-nav-list">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span className="sidebar-nav-text">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Admin section - only visible to ADMIN role */}
        {/* TODO: Member 1 - Uncomment and add admin-only pages */}
        {/* {isAdmin && (
          <>
            <p className="sidebar-nav-label" style={{ marginTop: '1rem' }}>Admin</p>
            <ul className="sidebar-nav-list">
              <li>
                <NavLink to="/admin/users" className="sidebar-nav-item">
                  <span className="sidebar-nav-icon"><MdPeople /></span>
                  <span className="sidebar-nav-text">Users</span>
                </NavLink>
              </li>
            </ul>
          </>
        )} */}
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-footer">
        {/* TODO: Member 1 - Add settings page */}
        {/* <button className="sidebar-footer-btn">
          <MdSettings /> Settings
        </button> */}
        <button className="sidebar-footer-btn sidebar-logout" onClick={handleLogout}>
          <MdLogout />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
