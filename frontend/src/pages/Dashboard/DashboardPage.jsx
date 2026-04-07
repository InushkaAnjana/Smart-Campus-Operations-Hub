/**
 * ================================================================
 * DashboardPage.jsx - Main Overview Dashboard
 * ================================================================
 * Owner: Member 1 (Team Lead) - Dashboard
 *
 * TODO Member 1:
 *  - Fetch real stats from backend (total resources, active bookings,
 *    open tickets, unread notifications)
 *  - Add recent bookings table
 *  - Add recent tickets list
 *  - Add charts for usage analytics (optional)
 *
 * TODO Member 2: Add "My Upcoming Bookings" widget here
 * TODO Member 3: Add "Available Resources" summary widget here
 * TODO Member 4: Add "Open Tickets" summary + notification widget here
 * ================================================================
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MdMeetingRoom, MdEventNote, MdBuild,
  MdNotifications, MdAdd, MdArrowForward,
} from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import './DashboardPage.css'

// ---- Placeholder stat data — replace with real API calls ----
const PLACEHOLDER_STATS = [
  { label: 'Total Resources',   value: '—', icon: <MdMeetingRoom />,  color: '#4f46e5', bg: '#eef2ff' },
  { label: 'Active Bookings',   value: '—', icon: <MdEventNote />,    color: '#10b981', bg: '#d1fae5' },
  { label: 'Open Tickets',      value: '—', icon: <MdBuild />,        color: '#f59e0b', bg: '#fef3c7' },
  { label: 'Notifications',     value: '—', icon: <MdNotifications />,color: '#3b82f6', bg: '#dbeafe' },
]

const DashboardPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(PLACEHOLDER_STATS)

  // TODO: Member 1 - Fetch real dashboard stats from aggregated API
  // useEffect(() => {
  //   const fetchStats = async () => { ... }
  //   fetchStats()
  // }, [])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="dashboard-page fade-in">
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <div className="dashboard-welcome-text">
          <h2>{greeting()}, {user?.name?.split(' ')[0] || 'User'} 👋</h2>
          <p>Here's a quick overview of your campus operations today.</p>
        </div>
        <div className="dashboard-welcome-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/bookings')}
          >
            <MdAdd /> New Booking
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Modules */}
      <div className="dashboard-modules">
        {/* TODO: Member 2 - Replace with real recent bookings data */}
        <div className="card dashboard-module">
          <div className="dashboard-module-header">
            <h3>Recent Bookings</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/bookings')}
            >
              View All <MdArrowForward />
            </button>
          </div>
          <div className="empty-state" style={{ padding: 'var(--spacing-8)' }}>
            <MdEventNote style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }} />
            <p>No recent bookings</p>
            <small>TODO: Member 2 — Load from /api/bookings/user/:id</small>
          </div>
        </div>

        {/* TODO: Member 4 - Replace with real recent tickets data */}
        <div className="card dashboard-module">
          <div className="dashboard-module-header">
            <h3>Recent Tickets</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/tickets')}
            >
              View All <MdArrowForward />
            </button>
          </div>
          <div className="empty-state" style={{ padding: 'var(--spacing-8)' }}>
            <MdBuild style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }} />
            <p>No open tickets</p>
            <small>TODO: Member 4 — Load from /api/tickets/user/:id</small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
