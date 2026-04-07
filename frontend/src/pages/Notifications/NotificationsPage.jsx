/**
 * ================================================================
 * NotificationsPage.jsx - Notifications Module
 * ================================================================
 * Owner: Member 4 - Notifications
 *
 * TODO Member 4:
 *  1. Fetch notifications from GET /api/notifications/user/:userId
 *  2. Implement markAsRead on notification click
 *  3. Implement "Mark All as Read" button
 *  4. Add notification type icons (BOOKING, TICKET, SYSTEM)
 *  5. Add delete notification support
 *  6. Consider adding real-time updates via WebSocket/polling
 * ================================================================
 */
import { useEffect } from 'react'
import { MdNotifications, MdDoneAll, MdCircle } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import useNotifications from '../../hooks/useNotifications'
import { format } from 'date-fns'
import './NotificationsPage.css'

const NotificationsPage = () => {
  const { user } = useAuth()
  const { notifications, unreadCount, loading, error, markRead, markAllRead } = useNotifications(user?.userId)

  // Notification type → icon + color map
  // TODO: Member 4 - Extend this map for all notification types
  const getTypeStyle = (type) => {
    const map = {
      BOOKING_CONFIRMED: { bg: 'var(--color-success-bg)', color: 'var(--color-success)' },
      TICKET_UPDATE:     { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)' },
      SYSTEM_ALERT:      { bg: 'var(--color-danger-bg)',  color: 'var(--color-danger)'  },
    }
    return map[type] || { bg: 'var(--color-primary-bg)', color: 'var(--color-primary)' }
  }

  return (
    <div className="notifications-page fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            Notifications
            {unreadCount > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: 'var(--spacing-3)', fontSize: '0.75rem' }}>
                {unreadCount} unread
              </span>
            )}
          </h2>
          <p className="page-subtitle">Your alerts, updates and system messages</p>
        </div>
        {unreadCount > 0 && (
          <button
            className="btn btn-secondary"
            id="mark-all-read-btn"
            onClick={markAllRead}
          >
            <MdDoneAll /> Mark All as Read
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="loading-overlay"><div className="spinner" /></div>}

      {/* Notifications List */}
      {!loading && (
        notifications.length === 0 ? (
          <div className="card empty-state">
            <MdNotifications style={{ fontSize: '3rem' }} />
            <h3>No notifications</h3>
            <p>You're all caught up! Notifications will appear here.</p>
          </div>
        ) : (
          <div className="notifications-list card" style={{ padding: 0, overflow: 'hidden' }}>
            {notifications.map((notification) => {
              const typeStyle = getTypeStyle(notification.type)
              return (
                <div
                  key={notification.id}
                  id={`notification-${notification.id}`}
                  className={`notification-item ${!notification.isRead ? 'notification-unread' : ''}`}
                  onClick={() => !notification.isRead && markRead(notification.id)}
                >
                  {/* Type Icon */}
                  <div
                    className="notification-icon"
                    style={{ background: typeStyle.bg, color: typeStyle.color }}
                  >
                    <MdNotifications />
                  </div>

                  {/* Content */}
                  <div className="notification-body">
                    <div className="notification-title">
                      {!notification.isRead && (
                        <MdCircle style={{ color: 'var(--color-primary)', fontSize: '0.5rem', marginRight: '0.4rem' }} />
                      )}
                      {notification.title}
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {notification.createdAt
                        ? format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')
                        : ''}
                    </span>
                  </div>

                  {/* Type Tag */}
                  {notification.type && (
                    <span className="notification-type-tag">
                      {notification.type.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}

export default NotificationsPage
