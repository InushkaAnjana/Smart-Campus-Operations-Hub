/**
 * NotificationsPage.jsx - Notifications Module (Modern Tailwind UI)
 */
import { useEffect } from 'react'
import { MdNotifications, MdDoneAll, MdCircle, MdEventAvailable, MdBuild, MdInfo, MdClose } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import useNotifications from '../../hooks/useNotifications'
import { format, formatDistanceToNow } from 'date-fns'

const TYPE_CONFIG = {
  BOOKING_CONFIRMED: { icon: MdEventAvailable, bg: 'bg-emerald-100', color: 'text-emerald-600', label: 'Booking' },
  TICKET_UPDATE:     { icon: MdBuild,          bg: 'bg-amber-100',   color: 'text-amber-600',   label: 'Ticket'  },
  SYSTEM_ALERT:      { icon: MdInfo,           bg: 'bg-red-100',     color: 'text-red-600',     label: 'System'  },
}
const DEFAULT_CONFIG = { icon: MdNotifications, bg: 'bg-indigo-100', color: 'text-indigo-600', label: 'Update' }

const NotificationsPage = () => {
  const { user } = useAuth()
  const { notifications, unreadCount, loading, error, markRead, markAllRead } = useNotifications(user?.userId)

  return (
    <div className="space-y-5 animate-[fadeInAnim_0.2s_ease]">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">Your alerts, updates and system messages</p>
        </div>
        {unreadCount > 0 && (
          <button
            id="mark-all-read-btn"
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm shrink-0"
          >
            <MdDoneAll className="text-lg" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">⚠ {error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <MdNotifications className="text-4xl text-indigo-300" />
          </div>
          <h3 className="text-base font-semibold text-slate-600">You're all caught up!</h3>
          <p className="text-sm mt-1">Notifications will appear here when there's something new.</p>
        </div>
      )}

      {/* List */}
      {!loading && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map(notification => {
            const cfg = TYPE_CONFIG[notification.type] || DEFAULT_CONFIG
            const Icon = cfg.icon
            const isUnread = !notification.isRead

            return (
              <div
                key={notification.id}
                id={`notification-${notification.id}`}
                onClick={() => isUnread && markRead(notification.id)}
                className={`group relative flex items-start gap-4 px-5 py-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isUnread
                    ? 'bg-indigo-50/60 border-indigo-200/80 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
                }`}
              >
                {/* Unread indicator */}
                {isUnread && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500" />
                )}

                {/* Icon */}
                <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${cfg.bg} ${cfg.color} text-xl shrink-0 mt-0.5`}>
                  <Icon />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">{notification.title}</span>
                    {notification.type && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{notification.message}</p>
                  <span className="text-xs text-slate-400 mt-1 block">
                    {notification.createdAt
                      ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                      : ''}
                  </span>
                </div>

                {/* Mark read hint */}
                {isUnread && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-indigo-400 font-medium shrink-0 self-center">
                    Mark read
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
