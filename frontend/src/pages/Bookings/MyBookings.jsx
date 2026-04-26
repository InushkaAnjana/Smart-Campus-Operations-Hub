/**
 * MyBookings.jsx — User's own bookings page
 *
 * API: GET /api/bookings/my  (JWT resolves userId server-side)
 *
 * Features:
 *   • Status filter tabs (ALL | PENDING | APPROVED | REJECTED | CANCELLED)
 *   • Cancel button for PENDING / APPROVED bookings
 *   • Shows rejection reason if status = REJECTED
 *   • Refresh on cancel success
 */
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import { MdEventNote, MdRefresh } from 'react-icons/md'
import { bookingService } from '../../services/bookingService'
import BookingTable from '../../components/Bookings/BookingTable'
import StatusBadge from '../../components/Bookings/StatusBadge'

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

const MyBookings = () => {
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [statusTab, setStatusTab] = useState('ALL')
  const [actionLoading, setActionLoading] = useState(new Set()) // IDs being processed

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchMyBookings = useCallback(async () => {
    setLoading(true)
    try {
      const data = await bookingService.getMyBookings()
      setBookings(data)
    } catch (err) {
      toast.error(err?.message || 'Failed to load your bookings.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMyBookings() }, [fetchMyBookings])

  // ── Filter by status tab ───────────────────────────────────────
  const filtered = bookings.filter(
    b => statusTab === 'ALL' || b.status === statusTab
  )

  // ── Status counts for tab badges ──────────────────────────────
  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === 'ALL' ? bookings.length : bookings.filter(b => b.status === s).length
    return acc
  }, {})

  // ── Cancel action ─────────────────────────────────────────────
  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    setActionLoading(prev => new Set(prev).add(id))
    try {
      await bookingService.cancelBooking(id)
      toast.success('Booking cancelled.')
      // Optimistically update local state
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b))
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel booking.')
    } finally {
      setActionLoading(prev => { const s = new Set(prev); s.delete(id); return s })
    }
  }

  return (
    <div className="space-y-5 animate-[fadeInAnim_0.2s_ease]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">My Bookings</h2>
          <p className="text-sm text-slate-500 mt-0.5">Your submitted resource reservations</p>
        </div>
        <button
          onClick={fetchMyBookings}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <MdRefresh className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Status Summary Pills ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {STATUS_TABS.map(s => (
          <button
            key={s}
            onClick={() => setStatusTab(s)}
            className={`flex flex-col items-center py-3 rounded-xl border text-center transition-all ${
              statusTab === s
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            <span className="text-lg font-extrabold leading-none">{counts[s] || 0}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide mt-0.5 opacity-80">
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
            </span>
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400">
          <MdEventNote className="text-6xl mb-3 opacity-30" />
          <h3 className="text-base font-semibold text-slate-600">No bookings found</h3>
          <p className="text-sm mt-1">
            {statusTab === 'ALL' ? 'You have no bookings yet.' : `No ${statusTab.toLowerCase()} bookings.`}
          </p>
        </div>
      )}

      {/* ── Bookings Table ── */}
      {!loading && filtered.length > 0 && (
        <BookingTable
          bookings={filtered}
          isAdmin={false}
          onCancel={handleCancel}
          actionLoading={actionLoading}
        />
      )}
    </div>
  )
}

export default MyBookings
