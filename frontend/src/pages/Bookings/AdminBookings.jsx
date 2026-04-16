/**
 * AdminBookings.jsx — Admin booking management panel
 *
 * API:
 *   GET    /api/bookings?status&resourceId&date  — filtered listing
 *   PUT    /api/bookings/:id/approve             — approve
 *   PUT    /api/bookings/:id/reject              — reject with reason
 *   PUT    /api/bookings/:id/cancel              — cancel
 *   DELETE /api/bookings/:id                     — soft-delete
 *
 * Features:
 *   • BookingFilters component — status, resourceId, date
 *   • Filters are debounced (auto-apply on change)
 *   • Approve with conflict detection feedback from backend
 *   • Reject with reason modal
 *   • Soft-delete with confirmation
 *   • Stat cards show counts by status
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import { MdAdminPanelSettings, MdClose, MdRefresh } from 'react-icons/md'
import { bookingService } from '../../services/bookingService'
import BookingTable from '../../components/Bookings/BookingTable'
import BookingFilters from '../../components/Bookings/BookingFilters'

const EMPTY_FILTERS = { status: '', resourceId: '', date: '' }

// ── Reject Reason Modal ────────────────────────────────────────
const RejectModal = ({ bookingId, onConfirm, onClose }) => {
  const [reason, setReason] = useState('')
  const [busy, setBusy]     = useState(false)

  const submit = async () => {
    if (!reason.trim()) { toast.warn('Please enter a rejection reason.'); return }
    setBusy(true)
    await onConfirm(bookingId, reason.trim())
    setBusy(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeInAnim_0.15s_ease]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl animate-[slideUpAnim_0.2s_ease]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Reject Booking</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 text-xl">×</button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 mb-3">Provide a reason for rejection (shown to the user):</p>
          <textarea
            autoFocus
            rows={4}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Resource is under maintenance on this date."
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-400 transition-all placeholder-slate-400"
          />
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-xl transition-all"
          >
            {busy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdClose />}
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────
const StatCard = ({ label, count, colorCls }) => (
  <div className={`flex flex-col items-center justify-center py-4 rounded-2xl border text-center ${colorCls}`}>
    <span className="text-2xl font-extrabold leading-none">{count}</span>
    <span className="text-[10px] font-bold uppercase tracking-wide mt-1 opacity-70">{label}</span>
  </div>
)

// ── Main Component ─────────────────────────────────────────────
const AdminBookings = () => {
  const [bookings, setBookings]         = useState([])
  const [loading, setLoading]           = useState(false)
  const [filters, setFilters]           = useState(EMPTY_FILTERS)
  const [actionLoading, setActionLoading] = useState(new Set())
  const [rejectTarget, setRejectTarget] = useState(null)  // bookingId to reject

  // ── Fetch with debounce ───────────────────────────────────────
  const debounceRef = useRef(null)

  const fetchBookings = useCallback(async (f = filters) => {
    setLoading(true)
    try {
      const data = await bookingService.getAllBookings(f)
      setBookings(data)
    } catch (err) {
      toast.error(err?.message || 'Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch whenever filters change (debounced 400ms for text inputs)
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchBookings(newFilters), 400)
  }

  useEffect(() => {
    fetchBookings(EMPTY_FILTERS)
    return () => clearTimeout(debounceRef.current)
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Action helpers ────────────────────────────────────────────
  const startAction = (id) => setActionLoading(p => new Set(p).add(id))
  const endAction   = (id) => setActionLoading(p => { const s = new Set(p); s.delete(id); return s })

  const updateLocal = (id, patch) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b))

  // APPROVE
  const handleApprove = async (id) => {
    startAction(id)
    try {
      const updated = await bookingService.approveBooking(id)
      updateLocal(id, { status: updated.status })
      toast.success('Booking approved ✓')
    } catch (err) {
      // Conflict errors from backend arrive as { errorCode: 'BOOKING_CONFLICT', message: '...' }
      const msg = err?.message || 'Approval failed.'
      toast.error(msg, { autoClose: 6000 })
    } finally {
      endAction(id)
    }
  }

  // REJECT — opens modal; actual API call handled inside modal's confirm
  const handleRejectConfirm = async (id, reason) => {
    startAction(id)
    try {
      const updated = await bookingService.rejectBooking(id, reason)
      updateLocal(id, { status: updated.status, rejectionReason: updated.rejectionReason })
      toast.success('Booking rejected.')
    } catch (err) {
      toast.error(err?.message || 'Rejection failed.')
    } finally {
      endAction(id)
    }
  }

  // CANCEL
  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    startAction(id)
    try {
      await bookingService.cancelBooking(id)
      updateLocal(id, { status: 'CANCELLED' })
      toast.success('Booking cancelled.')
    } catch (err) {
      toast.error(err?.message || 'Cancel failed.')
    } finally {
      endAction(id)
    }
  }

  // DELETE (soft)
  const handleDelete = async (id) => {
    if (!window.confirm('Permanently remove this booking record? (Soft delete — audit trail preserved)')) return
    startAction(id)
    try {
      await bookingService.deleteBooking(id)
      // Remove from local list since admin listings exclude DELETED
      setBookings(prev => prev.filter(b => b.id !== id))
      toast.success('Booking deleted.')
    } catch (err) {
      toast.error(err?.message || 'Delete failed.')
    } finally {
      endAction(id)
    }
  }

  // ── Derived stats ─────────────────────────────────────────────
  const stats = [
    { label: 'Pending',   count: bookings.filter(b => b.status === 'PENDING').length,   colorCls: 'bg-amber-50 border-amber-200 text-amber-700'    },
    { label: 'Approved',  count: bookings.filter(b => b.status === 'APPROVED').length,  colorCls: 'bg-emerald-50 border-emerald-200 text-emerald-700'},
    { label: 'Rejected',  count: bookings.filter(b => b.status === 'REJECTED').length,  colorCls: 'bg-red-50 border-red-200 text-red-700'           },
    { label: 'Cancelled', count: bookings.filter(b => b.status === 'CANCELLED').length, colorCls: 'bg-slate-50 border-slate-200 text-slate-500'     },
  ]

  return (
    <div className="space-y-5 animate-[fadeInAnim_0.2s_ease]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <MdAdminPanelSettings className="text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Admin — All Bookings</h2>
            <p className="text-sm text-slate-500 mt-0.5">Review, approve, reject, and manage campus bookings</p>
          </div>
        </div>
        <button
          onClick={() => fetchBookings(filters)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <MdRefresh className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Filters ── */}
      <BookingFilters
        filters={filters}
        onChange={handleFiltersChange}
        loading={loading}
      />

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {/* ── Results count ── */}
      {!loading && (
        <p className="text-xs text-slate-500 font-medium">
          {bookings.length === 0 ? 'No bookings match the selected filters.' : `Showing ${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {/* ── Empty State ── */}
      {!loading && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400">
          <MdAdminPanelSettings className="text-6xl mb-3 opacity-20" />
          <p className="text-base font-semibold text-slate-600">No bookings found</p>
          <p className="text-sm mt-1">Try clearing or adjusting the filters.</p>
        </div>
      )}

      {/* ── Table ── */}
      {!loading && bookings.length > 0 && (
        <BookingTable
          bookings={bookings}
          isAdmin
          onApprove={handleApprove}
          onReject={(id) => setRejectTarget(id)}
          onCancel={handleCancel}
          onDelete={handleDelete}
          actionLoading={actionLoading}
        />
      )}

      {/* ── Reject Reason Modal ── */}
      {rejectTarget && (
        <RejectModal
          bookingId={rejectTarget}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  )
}

export default AdminBookings
