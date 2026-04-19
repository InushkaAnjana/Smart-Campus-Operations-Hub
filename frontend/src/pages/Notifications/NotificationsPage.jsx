/**
 * NotificationsPage.jsx — Modern SaaS Notification Center
 *
 * UI FEATURES:
 *  ✔ Icon mapping per notification type (Calendar, Wrench, Chat, Check, Alert)
 *  ✔ Color-coded status badges (APPROVED=green, REJECTED=red, PENDING=yellow, UPDATE=blue)
 *  ✔ Clickable navigation: booking types → /bookings, ticket types → /tickets
 *  ✔ Unread highlight: light-indigo bg + bold text + blue left-border + dot indicator
 *  ✔ Elevated card with shadow-md on hover; smooth transitions
 */
import { useNavigate } from 'react-router-dom'
import {
  MdNotifications, MdDoneAll, MdClose,
  MdCalendarMonth, MdBuild, MdChat,
  MdCheckCircle, MdCancel, MdPendingActions,
  MdInfo, MdUpdate,
} from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import useNotifications from '../../hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'

// ── 1. Icon + colour mapping per backend notification type ─────────────────
const TYPE_CONFIG = {
  // Booking types
  BOOKING_PENDING:   {
    icon: MdPendingActions,
    iconBg: 'bg-amber-100',   iconColor: 'text-amber-600',
    badge: 'badge-warning',   label: 'Pending',
    route: '/bookings',
  },
  BOOKING_APPROVED:  {
    icon: MdCheckCircle,
    iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
    badge: 'badge-success',   label: 'Approved',
    route: '/bookings',
  },
  BOOKING_REJECTED:  {
    icon: MdCancel,
    iconBg: 'bg-red-100',     iconColor: 'text-red-600',
    badge: 'badge-danger',    label: 'Rejected',
    route: '/bookings',
  },
  BOOKING_CANCELLED: {
    icon: MdCalendarMonth,
    iconBg: 'bg-slate-100',   iconColor: 'text-slate-500',
    badge: 'badge-gray',      label: 'Cancelled',
    route: '/bookings',
  },
  // Ticket types
  TICKET_OPENED:     {
    icon: MdBuild,
    iconBg: 'bg-blue-100',    iconColor: 'text-blue-600',
    badge: 'badge-info',      label: 'New Ticket',
    route: '/tickets',
  },
  TICKET_UPDATED:    {
    icon: MdUpdate,
    iconBg: 'bg-indigo-100',  iconColor: 'text-indigo-600',
    badge: 'badge-primary',   label: 'Update',
    route: '/tickets',
  },
  TICKET_COMMENT:    {
    icon: MdChat,
    iconBg: 'bg-violet-100',  iconColor: 'text-violet-600',
    badge: 'badge-primary',   label: 'Comment',
    route: '/tickets',
  },
  // Legacy / catch-all
  BOOKING_CONFIRMED: {
    icon: MdCheckCircle,
    iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
    badge: 'badge-success',   label: 'Booking',
    route: '/bookings',
  },
  TICKET_UPDATE:     {
    icon: MdUpdate,
    iconBg: 'bg-indigo-100',  iconColor: 'text-indigo-600',
    badge: 'badge-primary',   label: 'Update',
    route: '/tickets',
  },
  SYSTEM_ALERT:      {
    icon: MdInfo,
    iconBg: 'bg-rose-100',    iconColor: 'text-rose-600',
    badge: 'badge-danger',    label: 'System',
    route: null,
  },
}

const DEFAULT_CONFIG = {
  icon: MdNotifications,
  iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600',
  badge: 'badge-primary',  label: 'Notification',
  route: null,
}

// ── Component ──────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const {
    notifications, unreadCount, loading, error,
    markRead, markAllRead, deleteNotification,
  } = useNotifications(user?.userId)

  // ── 3. Navigate to the relevant page when a card is clicked ────────────
  const handleCardClick = (notification) => {
    if (!notification.isRead) markRead(notification.id)
    const cfg   = TYPE_CONFIG[notification.type] || DEFAULT_CONFIG
    if (cfg.route) navigate(cfg.route)
  }

  return (
    <div className="space-y-6 animate-[fadeInAnim_0.2s_ease]">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm animate-pulse">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Stay on top of your bookings, tickets and system alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            id="mark-all-read-btn"
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-sm font-semibold rounded-xl border border-slate-200 hover:border-indigo-300 transition-all shadow-sm shrink-0"
          >
            <MdDoneAll className="text-lg" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <MdCancel className="text-red-400 text-lg shrink-0" /> {error}
        </div>
      )}

      {/* ── Loading ────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-28">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────── */}
      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-28 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400">
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-5 shadow-inner">
            <MdNotifications className="text-4xl text-indigo-300" />
          </div>
          <h3 className="text-base font-semibold text-slate-600 mb-1">You're all caught up!</h3>
          <p className="text-sm text-slate-400">Notifications will appear here when there's something new.</p>
        </div>
      )}

      {/* ── Notification list ──────────────────────────────────────────── */}
      {!loading && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map(notification => {
            const cfg    = TYPE_CONFIG[notification.type] || DEFAULT_CONFIG
            const Icon   = cfg.icon
            const isUnread = !notification.isRead

            return (
              <div
                key={notification.id}
                id={`notification-${notification.id}`}
                onClick={() => handleCardClick(notification)}
                className={[
                  'group relative flex items-start gap-4 px-5 py-4 rounded-2xl border',
                  'transition-all duration-200 cursor-pointer',
                  /* ── 5. Card elevation + unread highlighting ── */
                  isUnread
                    ? 'bg-indigo-50/70 border-l-4 border-l-indigo-500 border-t-indigo-200 border-r-indigo-200 border-b-indigo-200 shadow-md hover:shadow-lg hover:bg-indigo-50'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md',
                ].join(' ')}
              >
                {/* ── 4. Blue unread dot ───────────────────── */}
                {isUnread && (
                  <span className="absolute top-[18px] right-4 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-300" />
                )}

                {/* ── 1. Type icon ─────────────────────────── */}
                <div
                  className={[
                    'flex items-center justify-center w-12 h-12 rounded-xl shrink-0 mt-0.5',
                    'text-xl transition-transform group-hover:scale-105',
                    cfg.iconBg, cfg.iconColor,
                  ].join(' ')}
                >
                  <Icon />
                </div>

                {/* ── Content ──────────────────────────────── */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {/* ── 4. Bold title for unread ─────────── */}
                    <span className={`text-sm ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                      {notification.title}
                    </span>

                    {/* ── 2. Color-coded status badge ──────── */}
                    {notification.type && (
                      <span className={`badge ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    )}
                  </div>

                  <p className={`text-sm leading-relaxed ${isUnread ? 'text-slate-700' : 'text-slate-500'}`}>
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-400">
                      {notification.createdAt
                        ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                        : ''}
                    </span>
                    {/* ── 3. Navigation hint ───────────────── */}
                    {cfg.route && (
                      <span className="text-xs text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        → View {cfg.route === '/bookings' ? 'Bookings' : 'Tickets'}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Action column (mark read + delete) ───── */}
                <div className="flex flex-col items-end gap-2 shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUnread && (
                    <span className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wide">
                      Mark read
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notification.id)
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    aria-label="Delete notification"
                    id={`delete-notif-${notification.id}`}
                  >
                    <MdClose className="text-lg" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
