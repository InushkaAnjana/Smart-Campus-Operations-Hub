/**
 * ================================================================
 * Topbar.jsx - Top Navigation Bar
 * ================================================================
 * Owner: Member 1 (Team Lead) - Layout
 *
 * TODO Member 4:
 *  - Wire notification bell to real unread count
 *  - Add notification dropdown panel
 * TODO Member 1:
 *  - Add breadcrumb based on current route
 * ================================================================
 */
import { MdNotifications, MdMenu, MdSearch } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Topbar.css'

const Topbar = ({ onMenuToggle, pageTitle }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // TODO: Member 4 - Replace with real unread count from useNotifications hook
  const unreadCount = 3

  return (
    <header className="topbar">
      {/* Left: Mobile menu + Page title */}
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          <MdMenu />
        </button>
        <h1 className="topbar-title">{pageTitle}</h1>
      </div>

      {/* Right: Search + Notifications + Avatar */}
      <div className="topbar-right">
        {/* Search - TODO: Member 1 - Implement global search */}
        <button className="topbar-icon-btn" aria-label="Search">
          <MdSearch />
        </button>

        {/* Notification Bell */}
        <button
          className="topbar-icon-btn topbar-notif-btn"
          aria-label="Notifications"
          onClick={() => navigate('/notifications')}
        >
          <MdNotifications />
          {unreadCount > 0 && (
            <span className="topbar-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>

        {/* User Avatar */}
        <div className="topbar-avatar">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  )
}

export default Topbar
