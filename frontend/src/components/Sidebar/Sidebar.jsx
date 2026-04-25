/**
 * Sidebar.jsx - Main Navigation Sidebar (Modern Tailwind UI)
 */
import { NavLink, useNavigate } from 'react-router-dom'
import { MdDashboard, MdMeetingRoom, MdEventNote, MdBuild, MdNotifications, MdLogout, MdSchool, MdPeople } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import { getDisplayName, getAvatarInitial } from '../../utils/userUtils'

const NAV_ITEMS = [
  { label: 'Dashboard',     path: '/dashboard',     icon: MdDashboard,     description: 'Overview & stats' },
  { label: 'Resources',     path: '/resources',     icon: MdMeetingRoom,   description: 'Facilities & Rooms' },
  { label: 'Bookings',      path: '/bookings',      icon: MdEventNote,     description: 'Manage reservations' },
  { label: 'Tickets',       path: '/tickets',       icon: MdBuild,         description: 'Maintenance issues' },
  { label: 'Notifications', path: '/notifications', icon: MdNotifications, description: 'Alerts & updates' },
  { label: 'Users',         path: '/users',         icon: MdPeople,        description: 'User management', adminOnly: true },
]

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="flex flex-col h-full w-[260px] min-w-[260px] bg-[#1e1b4b] text-indigo-100 shadow-2xl">
      {/* ── Brand ── */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-800/50">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/30 text-indigo-200 text-xl shadow-inner">
          <MdSchool />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-white text-sm tracking-wide">SmartCampus</span>
          <span className="text-indigo-400 text-xs">Operations Hub</span>
        </div>
      </div>

      {/* ── User Info ── */}
      <div className="flex items-center gap-3 px-5 py-4 mx-3 mt-4 rounded-xl bg-indigo-800/30 border border-indigo-700/30">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold text-sm shadow-md shrink-0">
          {getAvatarInitial(user)}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-white truncate">{getDisplayName(user)}</span>
          <span className="text-xs text-indigo-400 uppercase tracking-widest">{user?.role || 'USER'}</span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold text-indigo-500 uppercase tracking-widest">Main Menu</p>
        <ul className="space-y-1">
          {NAV_ITEMS.filter(item => !item.adminOnly || isAdmin).map(({ label, path, icon: Icon, description }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                      : 'text-indigo-300 hover:bg-indigo-800/60 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`text-xl shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-200'}`}>
                      <Icon />
                    </span>
                    <span>{label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Footer ── */}
      <div className="px-3 py-4 border-t border-indigo-800/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-300 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 group"
        >
          <MdLogout className="text-xl shrink-0 group-hover:scale-110 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
