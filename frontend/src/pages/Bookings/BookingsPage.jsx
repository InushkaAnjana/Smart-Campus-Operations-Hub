/**
 * BookingsPage.jsx - Booking Management Module (Modern Tailwind UI)
 */
import { useEffect, useState } from 'react'
import { MdAdd, MdEventNote, MdCancel, MdAccessTime, MdLocationOn } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import useApi from '../../hooks/useApi'
import { bookingService } from '../../services/bookingService'
import { format } from 'date-fns'

const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

const STATUS_STYLE = {
  PENDING:   { cls: 'bg-amber-100 text-amber-800',   dot: 'bg-amber-400' },
  CONFIRMED: { cls: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  CANCELLED: { cls: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
  COMPLETED: { cls: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400' },
}

const BookingsPage = () => {
  const { user } = useAuth()
  const { data: bookings, loading, error, execute: fetchBookings } = useApi(bookingService.getByUser)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (user?.userId) fetchBookings(user.userId)
  }, [user])

  const filtered = (bookings || []).filter(b =>
    statusFilter === 'ALL' || b.status === statusFilter
  )

  const counts = STATUS_FILTERS.slice(1).reduce((acc, s) => {
    acc[s] = (bookings || []).filter(b => b.status === s).length
    return acc
  }, {})

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
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/25 hover:-translate-y-0.5 transition-all shrink-0"
        >
          <MdAdd className="text-xl" /> New Booking
        </button>
      </div>

      {/* ── Status Filter Pills ── */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(s => {
          const isActive = statusFilter === s
          const style = STATUS_STYLE[s]
          return (
            <button
              key={s}
              id={`booking-filter-${s.toLowerCase()}`}
              onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {s !== 'ALL' && style && (
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white/70' : style.dot}`} />
              )}
              {s.replace('_', ' ')}
              {s !== 'ALL' && counts[s] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                  {counts[s]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">⚠ {error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <MdEventNote className="text-6xl mb-3 opacity-30" />
          <h3 className="text-base font-semibold text-slate-600">No bookings found</h3>
          <p className="text-sm mt-1">Click "New Booking" to reserve a resource.</p>
        </div>
      )}

      {/* Bookings Table */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['#', 'Resource', 'Start Time', 'End Time', 'Purpose', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((booking, i) => {
                  const style = STATUS_STYLE[booking.status] || STATUS_STYLE.COMPLETED
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 text-slate-400 font-medium">{i + 1}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{booking.resource?.name}</div>
                        {booking.resource?.location && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <MdLocationOn className="text-sm" />{booking.resource.location}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <MdAccessTime className="text-slate-400 shrink-0" />
                          {booking.startTime ? format(new Date(booking.startTime), 'MMM dd, yyyy HH:mm') : '—'}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {booking.endTime ? format(new Date(booking.endTime), 'HH:mm') : '—'}
                      </td>
                      <td className="px-5 py-4 text-slate-600 max-w-[160px] truncate">{booking.purpose || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {booking.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {booking.status === 'PENDING' && (
                          <button
                            id={`cancel-booking-${booking.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                          >
                            <MdCancel /> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateBookingModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); fetchBookings(user?.userId) }}
        />
      )}
    </div>
  )
}

/* ── Create Booking Modal ── */
const CreateBookingModal = ({ onClose, onSuccess }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeInAnim_0.15s_ease]">
    <div
      className="w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-[slideUpAnim_0.2s_ease]"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <MdEventNote className="text-xl" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">New Booking</h3>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl transition-colors">×</button>
      </div>

      <div className="px-6 py-5 space-y-4">
        {[
          { label: 'Resource', id: 'booking-resource-select', type: 'select', options: ['-- Select a resource --'] },
        ].map(f => (
          <div key={f.id}>
            <label htmlFor={f.id} className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
            <select id={f.id} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
              {f.options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Start Time', id: 'booking-start-time', type: 'datetime-local' },
            { label: 'End Time',   id: 'booking-end-time',   type: 'datetime-local' },
          ].map(f => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
              <input id={f.id} type={f.type} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="booking-purpose" className="block text-sm font-medium text-slate-700 mb-1.5">Purpose</label>
          <textarea id="booking-purpose" rows={3} placeholder="Describe the purpose…" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" />
        </div>

        <div>
          <label htmlFor="booking-attendees" className="block text-sm font-medium text-slate-700 mb-1.5">Number of Attendees</label>
          <input id="booking-attendees" type="number" min={1} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
        <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
        <button id="booking-submit-btn" className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/25 hover:-translate-y-0.5 transition-all">
          Confirm Booking
        </button>
      </div>
    </div>
  </div>
)

export default BookingsPage
