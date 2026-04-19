/**
 * NotificationBell.jsx — Topbar Notification Dropdown
 *
 * UI UPGRADES:
 *  ✔ Per-type icon chip (Calendar=booking, Wrench=ticket, Chat=comment,
 *    Check=approved, Cancel=rejected, Pending=pending)
 *  ✔ Smart navigation: booking types → /bookings, ticket types → /tickets
 *  ✔ Color-coded icon backgrounds per type in dropdown
 *  ✔ Bold text + blue dot for unread items
 */
import { useState, useRef, useEffect } from 'react'
import {
  MdNotifications, MdDoneAll,
  MdCalendarMonth, MdBuild, MdChat,
  MdCheckCircle, MdCancel, MdPendingActions,
  MdInfo, MdUpdate,
} from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import useNotifications from '../../hooks/useNotifications'

// ── Type → icon + styles + route (mirrors NotificationsPage config) ─────────
const BELL_TYPE_CONFIG = {
  BOOKING_PENDING:   { icon: MdPendingActions, bg: 'bg-amber-100',   color: 'text-amber-600',   route: '/bookings' },
  BOOKING_APPROVED:  { icon: MdCheckCircle,    bg: 'bg-emerald-100', color: 'text-emerald-600', route: '/bookings' },
  BOOKING_REJECTED:  { icon: MdCancel,         bg: 'bg-red-100',     color: 'text-red-600',     route: '/bookings' },
  BOOKING_CANCELLED: { icon: MdCalendarMonth,  bg: 'bg-slate-100',   color: 'text-slate-500',   route: '/bookings' },
  BOOKING_CONFIRMED: { icon: MdCheckCircle,    bg: 'bg-emerald-100', color: 'text-emerald-600', route: '/bookings' },
  TICKET_OPENED:     { icon: MdBuild,          bg: 'bg-blue-100',    color: 'text-blue-600',    route: '/tickets'  },
  TICKET_UPDATED:    { icon: MdUpdate,         bg: 'bg-indigo-100',  color: 'text-indigo-600',  route: '/tickets'  },
  TICKET_UPDATE:     { icon: MdUpdate,         bg: 'bg-indigo-100',  color: 'text-indigo-600',  route: '/tickets'  },
  TICKET_COMMENT:    { icon: MdChat,           bg: 'bg-violet-100',  color: 'text-violet-600',  route: '/tickets'  },
  SYSTEM_ALERT:      { icon: MdInfo,           bg: 'bg-rose-100',    color: 'text-rose-600',    route: null        },
}
const BELL_DEFAULT = { icon: MdNotifications, bg: 'bg-indigo-100', color: 'text-indigo-600', route: '/notifications' }

const NotificationBell = () => {
  const { user } = useAuth()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(user?.userId)
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Top 5 most recent
  const previewList = notifications.slice(0, 5)

  // ── Smart navigation: mark read then go to the relevant page ──────────────
  const handleNotificationClick = (notif) => {
    markRead(notif.id)
    setIsOpen(false)
    const cfg = BELL_TYPE_CONFIG[notif.type] || BELL_DEFAULT
    navigate(cfg.route || '/notifications')
  }

  const handleViewAll = () => {
    setIsOpen(false)
    navigate('/notifications')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell button ──────────────────────────────────────────────────── */}
      <button
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
          isOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'
        }`}
      >
        <MdNotifications className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold shadow animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ───────────────────────────────────────────────── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-[fadeInAnim_0.2s_ease]">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
              >
                <MdDoneAll className="text-sm" /> Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[320px] overflow-y-auto">
            {previewList.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-8 text-slate-400">
                <MdNotifications className="text-3xl mb-2 text-slate-300" />
                <span className="text-sm">You're all caught up!</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {previewList.map(notif => {
                  const cfg      = BELL_TYPE_CONFIG[notif.type] || BELL_DEFAULT
                  const Icon     = cfg.icon
                  const isUnread = !notif.isRead

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={[
                        'flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50',
                        isUnread ? 'bg-indigo-50/40' : '',
                      ].join(' ')}
                    >
                      {/* ── Type icon chip ── */}
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5 text-base ${cfg.bg} ${cfg.color}`}>
                        <Icon />
                      </div>

                      {/* ── Text ── */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {isUnread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          )}
                          <p className={`text-sm truncate ${isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                            {notif.title}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {notif.createdAt
                            ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                            : ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            onClick={handleViewAll}
            className="px-4 py-2.5 text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border-t border-slate-100 cursor-pointer transition-colors"
          >
            View all notifications →
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
