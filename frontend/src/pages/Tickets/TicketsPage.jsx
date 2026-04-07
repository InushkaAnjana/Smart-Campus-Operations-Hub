/**
 * ================================================================
 * TicketsPage.jsx - Maintenance & Tickets Module
 * ================================================================
 * Owner: Member 4 - Maintenance & Tickets
 *
 * TODO Member 4:
 *  1. Fetch tickets from GET /api/tickets/user/:userId (student view)
 *     OR GET /api/tickets (admin/staff view)
 *  2. Implement "Report Issue" form modal with:
 *     - Title, Description fields
 *     - Resource selector
 *     - Priority selector (LOW, MEDIUM, HIGH, CRITICAL)
 *  3. Add status filter tabs (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
 *  4. For admin: add "Update Status" and "Assign to Staff" actions
 *  5. Add priority color coding (RED=CRITICAL, ORANGE=HIGH, etc.)
 *  6. Show ticket statistics summary (count by status)
 * ================================================================
 */
import { useEffect, useState } from 'react'
import { MdAdd, MdBuild, MdCheckCircle, MdError } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import useApi from '../../hooks/useApi'
import { ticketService } from '../../services/ticketService'
import { format } from 'date-fns'
import './TicketsPage.css'

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

const priorityBadge = (priority) => ({
  LOW:      'badge-info',
  MEDIUM:   'badge-warning',
  HIGH:     'badge-danger',
  CRITICAL: 'badge-danger',
}[priority] || 'badge-gray')

const statusBadge = (status) => ({
  OPEN:        'badge-danger',
  IN_PROGRESS: 'badge-warning',
  RESOLVED:    'badge-success',
  CLOSED:      'badge-gray',
}[status] || 'badge-gray')

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

  const filtered = tickets?.filter(t =>
    statusFilter === 'ALL' || t.status === statusFilter
  ) || []

  return (
    <div className="tickets-page fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Maintenance Tickets</h2>
          <p className="page-subtitle">{isStaff ? 'Manage all reported issues' : 'Track your reported issues'}</p>
        </div>
        <button
          className="btn btn-primary"
          id="create-ticket-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <MdAdd /> Report Issue
        </button>
      </div>

      {/* Stats Row — TODO: Member 4 - Replace with real stats */}
      <div className="tickets-stats">
        {[
          { label: 'Open',        count: tickets?.filter(t => t.status === 'OPEN').length || 0,        color: 'var(--color-danger)'  },
          { label: 'In Progress', count: tickets?.filter(t => t.status === 'IN_PROGRESS').length || 0, color: 'var(--color-warning)' },
          { label: 'Resolved',    count: tickets?.filter(t => t.status === 'RESOLVED').length || 0,    color: 'var(--color-success)' },
          { label: 'Closed',      count: tickets?.filter(t => t.status === 'CLOSED').length || 0,      color: 'var(--color-gray-400)'},
        ].map(stat => (
          <div key={stat.label} className="ticket-stat-pill card">
            <span style={{ color: stat.color, fontWeight: 700, fontSize: 'var(--font-size-xl)' }}>{stat.count}</span>
            <span style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-sm)' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="bookings-tabs">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            id={`ticket-filter-${s.toLowerCase()}`}
            className={`bookings-tab ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="loading-overlay"><div className="spinner" /></div>}

      {/* Tickets Table */}
      {!loading && (
        filtered.length === 0 ? (
          <div className="card empty-state">
            <MdBuild style={{ fontSize: '3rem' }} />
            <h3>No tickets found</h3>
            <p>Click "Report Issue" to submit a maintenance request.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Resource</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket, i) => (
                  <tr key={ticket.id}>
                    <td>{i + 1}</td>
                    <td><strong>{ticket.title}</strong><br /><small style={{ color: 'var(--color-gray-400)' }}>{ticket.description?.slice(0, 50)}…</small></td>
                    <td>{ticket.resource?.name || '—'}</td>
                    <td><span className={`badge ${priorityBadge(ticket.priority)}`}>{ticket.priority}</span></td>
                    <td><span className={`badge ${statusBadge(ticket.status)}`}>{ticket.status?.replace('_', ' ')}</span></td>
                    <td>{ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM dd, yyyy') : '—'}</td>
                    <td>
                      {/* TODO: Member 4 - Add update status for staff */}
                      {isStaff && (
                        <button className="btn btn-secondary btn-sm" id={`update-ticket-${ticket.id}`}>
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); if (isStaff) fetchTickets(); else fetchTickets(user?.userId) }}
        />
      )}
    </div>
  )
}

// ---- Report Issue Modal ----
// TODO: Member 4 - Implement form submission
const CreateTicketModal = ({ onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3 className="modal-title">Report Maintenance Issue</h3>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="form-group">
        <label className="form-label">Issue Title</label>
        <input id="ticket-title" className="form-control" placeholder="Brief title of the issue" />
      </div>
      <div className="form-group">
        <label className="form-label">Resource / Location</label>
        <select id="ticket-resource" className="form-control">
          <option>-- Select resource --</option>
          {/* TODO: Member 4 - Populate from /api/resources */}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Priority</label>
        <select id="ticket-priority" className="form-control">
          <option value="LOW">Low</option>
          <option value="MEDIUM" selected>Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea id="ticket-description" className="form-control" rows={4} placeholder="Describe the issue in detail..." />
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" id="ticket-submit-btn">
          {/* TODO: Member 4 - Wire to ticketService.create() */}
          Submit Ticket
        </button>
      </div>
    </div>
  </div>
)

export default TicketsPage
