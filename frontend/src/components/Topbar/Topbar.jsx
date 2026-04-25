/**
 * Topbar.jsx - Top Navigation Bar (Modern Tailwind UI)
 */
import { MdNotifications, MdMenu, MdSearch } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getDisplayName, getAvatarInitial } from '../../utils/userUtils'

import NotificationBell from './NotificationBell'

const Topbar = ({ onMenuToggle, pageTitle }) => {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          className="flex lg:hidden items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <MdMenu className="text-xl" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">{pageTitle}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search btn */}
        <button
          aria-label="Search"
          className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
        >
          <MdSearch className="text-xl" />
        </button>

        {/* Notification Bell Dropdown */}
        <NotificationBell />

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Avatar */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-default transition-colors">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shadow">
            {getAvatarInitial(user)}
          </div>
          <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
            {getDisplayName(user)}
          </span>
        </div>
      </div>
    </header>
  )
}

export default Topbar
