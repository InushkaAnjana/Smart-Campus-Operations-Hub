/**
 * ================================================================
 * BookingsPage.jsx - Booking Management Module
 * ================================================================
 * Owner: Member 2 - Booking Management
 *
 * TODO Member 2:
 *  1. Fetch user's bookings from GET /api/bookings/user/:userId
 *  2. Implement "Create Booking" form modal
 *     - Resource selector (dropdown from /api/resources/available)
 *     - Date/time pickers for start and end time
 *     - Purpose and attendee count fields
 *  3. Implement cancel booking button
 *  4. Add status filter tabs (ALL, PENDING, CONFIRMED, CANCELLED)
 *  5. Add calendar view (optional enhancement)
 *  6. Show conflict error if slot unavailable
 * ================================================================
 */
import { useEffect, useState } from 'react'
import { MdAdd, MdEventNote, MdCancel, MdCheckCircle, MdSchedule } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import useApi from '../../hooks/useApi'
import { bookingService } from '../../services/bookingService'
import { format } from 'date-fns'
import './BookingsPage.css'

const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

const statusBadge = (status) => {
  const map = {
    PENDING:   'badge-warning',
    CONFIRMED: 'badge-success',
    CANCELLED: 'badge-danger',
    COMPLETED: 'badge-gray',
  }
  return map[status] || 'badge-gray'
}

const BookingsPage = () => {
  const { user } = useAuth()
  const { data: bookings, loading, error, execute: fetchBookings } = useApi(bookingService.getByUser)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (user?.userId) fetchBookings(user.userId)
  }, [user])

  const filtered = bookings?.filter(b =>
    statusFilter === 'ALL' || b.status === statusFilter
  ) || []

  return (
    <div className="bookings-page fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Booking Management</h2>
          <p className="page-subtitle">View and manage your resource reservations</p>
        </div>
        <button
          className="btn btn-primary"
          id="create-booking-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <MdAdd /> New Booking
        </button>
      </div>

      {/* Status Filter Tabs */}
      {/* TODO: Member 2 - Wire these tabs to filter bookings by status */}
      <div className="bookings-tabs">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            id={`booking-filter-${s.toLowerCase()}`}
            className={`bookings-tab ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Loading */}
      {loading && <div className="loading-overlay"><div className="spinner" /></div>}

      {/* Bookings Table */}
      {!loading && (
        filtered.length === 0 ? (
          <div className="card empty-state">
            <MdEventNote style={{ fontSize: '3rem' }} />
            <h3>No bookings found</h3>
            <p>Click "New Booking" to reserve a resource.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Resource</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking, i) => (
                  <tr key={booking.id}>
                    <td>{i + 1}</td>
                    <td><strong>{booking.resource?.name}</strong><br /><small>{booking.resource?.location}</small></td>
                    <td>{booking.startTime ? format(new Date(booking.startTime), 'MMM dd, yyyy HH:mm') : '—'}</td>
                    <td>{booking.endTime ? format(new Date(booking.endTime), 'HH:mm') : '—'}</td>
                    <td>{booking.purpose || '—'}</td>
                    <td><span className={`badge ${statusBadge(booking.status)}`}>{booking.status}</span></td>
                    <td>
                      {/* TODO: Member 2 - Implement cancel action */}
                      {booking.status === 'PENDING' && (
                        <button className="btn btn-danger btn-sm" id={`cancel-booking-${booking.id}`}>
                          <MdCancel /> Cancel
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

      {/* Create Booking Modal */}
      {showCreateModal && (
        <CreateBookingModal onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchBookings(user?.userId) }} />
      )}
    </div>
  )
}

// ---- Create Booking Modal ----
// TODO: Member 2 - Implement this form fully
const CreateBookingModal = ({ onClose, onSuccess }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">New Booking</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* TODO: Member 2 - Build out this form */}
        <div className="form-group">
          <label className="form-label">Resource</label>
          <select id="booking-resource-select" className="form-control">
            <option>-- Select a resource --</option>
            {/* TODO: Member 2 - Populate from /api/resources/available */}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Start Time</label>
          <input id="booking-start-time" type="datetime-local" className="form-control" />
        </div>

        <div className="form-group">
          <label className="form-label">End Time</label>
          <input id="booking-end-time" type="datetime-local" className="form-control" />
        </div>

        <div className="form-group">
          <label className="form-label">Purpose</label>
          <textarea id="booking-purpose" className="form-control" rows={3} placeholder="Describe the purpose..." />
        </div>

        <div className="form-group">
          <label className="form-label">Number of Attendees</label>
          <input id="booking-attendees" type="number" className="form-control" min={1} />
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" id="booking-submit-btn">
            {/* TODO: Member 2 - Wire to bookingService.create() */}
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookingsPage
