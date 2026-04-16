/**
 * DashboardPage.jsx - Main Overview Dashboard (Modern Tailwind UI)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MdMeetingRoom, MdEventNote, MdBuild,
  MdNotifications, MdAdd, MdArrowForward,
  MdTrendingUp,
} from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'

const STATS = [
  { label: 'Total Resources',  value: '—', icon: MdMeetingRoom,   gradient: 'from-indigo-500 to-purple-600',   ring: 'ring-indigo-200' },
  { label: 'Active Bookings',  value: '—', icon: MdEventNote,     gradient: 'from-emerald-400 to-teal-600',    ring: 'ring-emerald-200' },
  { label: 'Open Tickets',     value: '—', icon: MdBuild,         gradient: 'from-amber-400 to-orange-500',    ring: 'ring-amber-200' },
  { label: 'Notifications',    value: '—', icon: MdNotifications, gradient: 'from-blue-400 to-sky-600',        ring: 'ring-blue-200' },
]

const DashboardPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats] = useState(STATS)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6 animate-[fadeInAnim_0.2s_ease]">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] px-8 py-7 shadow-xl shadow-indigo-900/20">
        {/* Decorative blobs */}
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
        {stats.map(({ label, value, icon: Icon, gradient, ring }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.07)] hover:shadow-[0_4px_12px_-2px_rgba(79,70,229,0.15)] hover:-translate-y-1 transition-all duration-200 p-5 flex items-center gap-4"
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} text-white text-2xl shadow-md shrink-0`}>
              <Icon />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800 leading-none">{value}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Module Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.07)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <MdEventNote />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Recent Bookings</h3>
            </div>
            <button
              onClick={() => navigate('/bookings')}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View All <MdArrowForward />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-14 text-slate-400">
            <MdEventNote className="text-5xl mb-3 opacity-30" />
            <p className="text-sm font-medium">No recent bookings</p>
            <p className="text-xs opacity-70 mt-1">Your reservations will appear here</p>
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.07)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <MdBuild />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Recent Tickets</h3>
            </div>
            <button
              onClick={() => navigate('/tickets')}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View All <MdArrowForward />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-14 text-slate-400">
            <MdBuild className="text-5xl mb-3 opacity-30" />
            <p className="text-sm font-medium">No open tickets</p>
            <p className="text-xs opacity-70 mt-1">Maintenance requests will appear here</p>
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
