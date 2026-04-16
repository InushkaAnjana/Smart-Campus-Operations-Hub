/**
 * TicketsPage.jsx - Maintenance & Tickets Module (Modern Tailwind UI)
 */
import { useEffect, useState } from 'react'
import { MdAdd, MdBuild, MdEdit, MdFlag } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import useApi from '../../hooks/useApi'
import { ticketService } from '../../services/ticketService'
import { format } from 'date-fns'

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

const PRIORITY_STYLE = {
  LOW:      { cls: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400' },
  MEDIUM:   { cls: 'bg-amber-100 text-amber-800',   dot: 'bg-amber-400' },
  HIGH:     { cls: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  CRITICAL: { cls: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
}

const STATUS_STYLE = {
  OPEN:        { cls: 'bg-red-100 text-red-700',     dot: 'bg-red-500',     card: 'bg-red-50 border-red-200 text-red-700' },
  IN_PROGRESS: { cls: 'bg-amber-100 text-amber-800', dot: 'bg-amber-400',   card: 'bg-amber-50 border-amber-200 text-amber-700' },
  RESOLVED:    { cls: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', card: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  CLOSED:      { cls: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400',   card: 'bg-slate-50 border-slate-200 text-slate-500' },
}

const TicketsPage = () => {
  const { user, isStaff } = useAuth()
  const { data: tickets, loading, error, execute: fetchTickets } = useApi(
    isStaff ? ticketService.getAll : ticketService.getByUser
  )
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (isStaff) fetchTickets()
    else if (user?.userId) fetchTickets(user.userId)
  }, [user, isStaff])

  const filtered = (tickets || []).filter(t =>
    statusFilter === 'ALL' || t.status === statusFilter
  )

  const statCounts = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => ({
    label: s.replace('_', ' '),
    count: (tickets || []).filter(t => t.status === s).length,
    style: STATUS_STYLE[s]?.card || '',
  }))

  return (
    <div className="space-y-5 animate-[fadeInAnim_0.2s_ease]">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Maintenance Tickets</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isStaff ? 'Manage all reported issues' : 'Track your reported issues'}
          </p>
        </div>
        <button
          id="create-ticket-btn"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/25 hover:-translate-y-0.5 transition-all shrink-0"
        >
          <MdAdd className="text-xl" /> Report Issue
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCounts.map(({ label, count, style }) => (
          <div key={label} className={`flex flex-col items-center justify-center py-4 rounded-2xl border text-center ${style}`}>
            <span className="text-2xl font-extrabold leading-none">{count}</span>
            <span className="text-xs font-semibold uppercase tracking-wide mt-1 opacity-80">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Status Filter Pills ── */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(s => {
          const isActive = statusFilter === s
          const style = STATUS_STYLE[s]
          return (
            <button
              key={s}
              id={`ticket-filter-${s.toLowerCase()}`}
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
          <MdBuild className="text-6xl mb-3 opacity-30" />
          <h3 className="text-base font-semibold text-slate-600">No tickets found</h3>
          <p className="text-sm mt-1">Click "Report Issue" to submit a maintenance request.</p>
        </div>
      )}

      {/* Tickets Table */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['#', 'Title', 'Resource', 'Priority', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((ticket, i) => {
                  const pStyle = PRIORITY_STYLE[ticket.priority] || PRIORITY_STYLE.LOW
                  const sStyle = STATUS_STYLE[ticket.status] || STATUS_STYLE.CLOSED
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 text-slate-400 font-medium">{i + 1}</td>
                      <td className="px-5 py-4 max-w-[200px]">
                        <div className="font-semibold text-slate-800 truncate">{ticket.title}</div>
                        {ticket.description && (
                          <div className="text-xs text-slate-400 mt-0.5 truncate">{ticket.description.slice(0, 55)}…</div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{ticket.resource?.name || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${pStyle.cls}`}>
                          <MdFlag className="text-sm" />
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sStyle.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sStyle.dot}`} />
                          {ticket.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-xs">
                        {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM dd, yyyy') : '—'}
                      </td>
                      <td className="px-5 py-4">
                        {isStaff && (
                          <button
                            id={`update-ticket-${ticket.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                          >
                            <MdEdit /> Update
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
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); if (isStaff) fetchTickets(); else fetchTickets(user?.userId) }}
        />
      )}
    </div>
  )
}

/* ── Report Issue Modal ── */
const CreateTicketModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeInAnim_0.15s_ease]">
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-[slideUpAnim_0.2s_ease]" onClick={e => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <MdBuild className="text-xl" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Report Maintenance Issue</h3>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl transition-colors">×</button>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div>
          <label htmlFor="ticket-title" className="block text-sm font-medium text-slate-700 mb-1.5">Issue Title</label>
          <input id="ticket-title" placeholder="Brief title of the issue" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" />
        </div>

        <div>
          <label htmlFor="ticket-resource" className="block text-sm font-medium text-slate-700 mb-1.5">Resource / Location</label>
          <select id="ticket-resource" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
            <option>-- Select resource --</option>
          </select>
        </div>

        <div>
          <label htmlFor="ticket-priority" className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
          <div className="grid grid-cols-4 gap-2">
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p, idx) => {
              const colors = [
                'bg-blue-50 border-blue-200 text-blue-700 data-[selected]:bg-blue-500 data-[selected]:text-white data-[selected]:border-blue-500',
                'bg-amber-50 border-amber-200 text-amber-700 data-[selected]:bg-amber-500 data-[selected]:text-white data-[selected]:border-amber-500',
                'bg-orange-50 border-orange-200 text-orange-700 data-[selected]:bg-orange-500 data-[selected]:text-white data-[selected]:border-orange-500',
                'bg-red-50 border-red-200 text-red-700 data-[selected]:bg-red-500 data-[selected]:text-white data-[selected]:border-red-500',
              ]
              return (
                <label key={p} className={`flex items-center justify-center py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all hover:shadow-sm select-none ${colors[idx]} ${p === 'MEDIUM' ? 'ring-2 ring-amber-400' : ''}`}>
                  <input type="radio" name="priority" value={p} defaultChecked={p === 'MEDIUM'} className="sr-only" />
                  {p}
                </label>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="ticket-description" className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea id="ticket-description" rows={4} placeholder="Describe the issue in detail…" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
        <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
        <button id="ticket-submit-btn" className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/25 hover:-translate-y-0.5 transition-all">
          Submit Ticket
        </button>
      </div>
    </div>
  </div>
)

export default TicketsPage
