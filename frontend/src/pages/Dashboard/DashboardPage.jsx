/**
 * DashboardPage.jsx - Main Overview Dashboard (Modern Tailwind UI)
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MdMeetingRoom, MdEventNote, MdBuild,
  MdNotifications, MdAdd, MdArrowForward,
} from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import { resourceService } from '../../services/resourceService'
import { bookingService } from '../../services/bookingService'
import { ticketService } from '../../services/ticketService'
import { notificationService } from '../../services/notificationService'

const DashboardPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    { label: 'Total Resources',  value: '—', icon: MdMeetingRoom,   gradient: 'from-indigo-500 to-purple-600',   ring: 'ring-indigo-200' },
    { label: 'Active Bookings',  value: '—', icon: MdEventNote,     gradient: 'from-emerald-400 to-teal-600',    ring: 'ring-emerald-200' },
    { label: 'Open Tickets',     value: '—', icon: MdBuild,         gradient: 'from-amber-400 to-orange-500',    ring: 'ring-amber-200' },
    { label: 'Notifications',    value: '—', icon: MdNotifications, gradient: 'from-blue-400 to-sky-600',        ring: 'ring-blue-200' },
  ])
  const [recentBookings, setRecentBookings] = useState([])
  const [recentTickets, setRecentTickets] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userId = user?.id || user?.userId
        
        const [resources, bookings, tickets, unreadCount] = await Promise.all([
          resourceService.getResources().catch(() => []),
          bookingService.getMyBookings().catch(() => []),
          ticketService.getMyTickets().catch(() => []),
          userId ? notificationService.getUnreadCount(userId).catch(() => 0) : Promise.resolve(0)
        ])

        const activeBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'APPROVED')
        const openTickets = tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED')

        setStats([
          { label: 'Total Resources',  value: resources.length || 0, icon: MdMeetingRoom,   gradient: 'from-indigo-500 to-purple-600',   ring: 'ring-indigo-200' },
          { label: 'Active Bookings',  value: activeBookings.length, icon: MdEventNote,     gradient: 'from-emerald-400 to-teal-600',    ring: 'ring-emerald-200' },
          { label: 'Open Tickets',     value: openTickets.length,    icon: MdBuild,         gradient: 'from-amber-400 to-orange-500',    ring: 'ring-amber-200' },
          { label: 'Notifications',    value: unreadCount || 0,      icon: MdNotifications, gradient: 'from-blue-400 to-sky-600',        ring: 'ring-blue-200' },
        ])

        const sortedBookings = [...bookings].sort((a,b) => new Date(b.createdAt || b.startTime || 0) - new Date(a.createdAt || a.startTime || 0)).slice(0, 3)
        const sortedTickets = [...tickets].sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3)

        setRecentBookings(sortedBookings)
        setRecentTickets(sortedTickets)

      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'APPROVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200'
      case 'OPEN': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'CLOSED': return 'bg-slate-100 text-slate-700 border-slate-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6 animate-[fadeInAnim_0.2s_ease]">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] px-8 py-7 shadow-xl shadow-indigo-900/20">
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-indigo-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              {greeting()}, {user?.name?.split(' ')[0] || 'User'} 👋
            </h2>
            <p className="mt-1 text-indigo-300 text-sm">Here's a quick overview of your campus operations today.</p>
          </div>
          <button
            onClick={() => navigate('/bookings')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-50 hover:-translate-y-0.5 transition-all shadow-md shrink-0"
          >
            <MdAdd className="text-lg" /> New Booking
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, gradient }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.07)] hover:shadow-[0_4px_12px_-2px_rgba(79,70,229,0.15)] hover:-translate-y-1 transition-all duration-200 p-5 flex items-center gap-4"
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} text-white text-2xl shadow-md shrink-0`}>
              <Icon />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800 leading-none">
                {loading ? <span className="animate-pulse">...</span> : value}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Module Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.07)] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <MdEventNote />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Recent Bookings</h3>
            </div>
            <button onClick={() => navigate('/bookings')} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
              View All <MdArrowForward />
            </button>
          </div>
          
          <div className="flex-1 p-0">
            {loading ? (
              <div className="flex justify-center py-10"><span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span></div>
            ) : recentBookings.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {recentBookings.map((b) => (
                  <li key={b.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{b.resourceName || 'Resource Booking'}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {b.startTime ? new Date(b.startTime).toLocaleString() : 'Date to be confirmed'}
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400">
                <MdEventNote className="text-5xl mb-3 opacity-30" />
                <p className="text-sm font-medium">No recent bookings</p>
                <p className="text-xs opacity-70 mt-1">Your reservations will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.07)] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <MdBuild />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Recent Tickets</h3>
            </div>
            <button onClick={() => navigate('/tickets')} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
              View All <MdArrowForward />
            </button>
          </div>
          
          <div className="flex-1 p-0">
            {loading ? (
              <div className="flex justify-center py-10"><span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span></div>
            ) : recentTickets.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {recentTickets.map((t) => (
                  <li key={t.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{t.title || 'Maintenance Request'}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recent Request'}
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(t.status)}`}>
                        {t.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400">
                <MdBuild className="text-5xl mb-3 opacity-30" />
                <p className="text-sm font-medium">No open tickets</p>
                <p className="text-xs opacity-70 mt-1">Maintenance requests will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Resources', path: '/resources', icon: MdMeetingRoom, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
          { label: 'Bookings',  path: '/bookings',  icon: MdEventNote,   color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
          { label: 'Tickets',   path: '/tickets',   icon: MdBuild,       color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
          { label: 'Alerts',    path: '/notifications', icon: MdNotifications, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
        ].map(({ label, path, icon: Icon, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-2 py-5 rounded-2xl border border-transparent ${color} transition-all duration-200 hover:-translate-y-0.5 active:scale-95`}
          >
            <Icon className="text-2xl" />
            <span className="text-xs font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage
