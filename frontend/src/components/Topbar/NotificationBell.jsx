import { useState, useRef, useEffect } from 'react'
import { MdNotifications, MdDoneAll } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import useNotifications from '../../hooks/useNotifications'

const NotificationBell = () => {
  const { user } = useAuth()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(user?.userId)
  const navigate = useNavigate()
  
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Clicking outside closes the dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Get only unread or top 5 recent notifications for the dropdown
  const previewList = notifications.slice(0, 5)

  const handleNotificationClick = (id) => {
    markRead(id)
    setIsOpen(false)
    navigate('/notifications')
  }

  const handleViewAll = () => {
    setIsOpen(false)
    navigate('/notifications')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
          isOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'
        }`}
      >
        <MdNotifications className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold shadow">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-[fadeInAnim_0.2s_ease]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
              >
                <MdDoneAll /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {previewList.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                You're all caught up!
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {previewList.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id)}
                    className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                      !notif.isRead ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {!notif.isRead && (
                        <div className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-indigo-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.isRead ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            onClick={handleViewAll}
            className="px-4 py-2.5 text-center text-sm font-medium text-indigo-600 hover:bg-slate-50 border-t border-slate-100 cursor-pointer transition-colors"
          >
            View all notifications
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
