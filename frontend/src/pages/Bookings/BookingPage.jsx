/**
 * BookingPage.jsx — Booking Management Entry Point
 *
 * Role-based routing:
 *   ADMIN → AdminBookings (full management panel + filters + workflow actions)
 *   USER  → Tab between "My Bookings" and "New Booking"
 *
 * This is the page mounted at /bookings (replacing the old BookingsPage.jsx stub).
 */
import { useState } from 'react'
import { MdAdd, MdEventNote, MdAdminPanelSettings, MdListAlt } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import AdminBookings from './AdminBookings'
import MyBookings from './MyBookings'
import BookingForm from '../../components/Bookings/BookingForm'

// ── Modal shell ────────────────────────────────────────────────
const Modal = ({ title, icon: Icon, iconBg, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeInAnim_0.15s_ease]">
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-[slideUpAnim_0.2s_ease]" onClick={e => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon className="text-xl" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">{title}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl transition-colors"
        >
          ×
        </button>
      </div>
      {/* Body */}
      <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
    </div>
  </div>
)

// ── User View — tabs: My Bookings / New Booking ────────────────
const UserBookingView = () => {
  const [tab, setTab]         = useState('my')         // 'my' | 'new'
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)       // bump to re-mount MyBookings

  const handleBookingSuccess = () => {
    setShowModal(false)
    setRefreshKey(k => k + 1)   // force MyBookings to re-fetch
  }

  return (
    <div className="space-y-5 animate-[fadeInAnim_0.2s_ease]">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Booking Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">View and manage your resource reservations</p>
        </div>
        <button
          id="create-booking-btn"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/25 hover:-translate-y-0.5 transition-all shrink-0"
        >
          <MdAdd className="text-xl" /> New Booking
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { key: 'my',  label: 'My Bookings', icon: MdListAlt },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === key
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon /> {label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <MyBookings key={refreshKey} />

      {/* ── New Booking Modal ── */}
      {showModal && (
        <Modal
          title="New Booking"
          icon={MdEventNote}
          iconBg="bg-indigo-100 text-indigo-600"
          onClose={() => setShowModal(false)}
        >
          <BookingForm
            onSuccess={handleBookingSuccess}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}

// ── Admin View — header + AdminBookings panel ──────────────────
const AdminBookingView = () => (
  <AdminBookings />
)

// ── Page Entry Point ──────────────────────────────────────────
const BookingPage = () => {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminBookingView /> : <UserBookingView />
}

export default BookingPage
