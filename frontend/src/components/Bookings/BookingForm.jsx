/**
 * BookingForm.jsx — Create Booking form (USER)
 *
 * Fields:
 *   resourceId    — dropdown populated from GET /api/resources/available
 *   startTime     — datetime-local input
 *   endTime       — datetime-local input
 *   purpose       — textarea
 *   attendeeCount — number input (min 1)
 *
 * Validation (client-side before sending):
 *   • All fields required
 *   • startTime < endTime
 *   • attendeeCount ≥ 1
 *   • duration ≥ 15 minutes
 *
 * On conflict error from backend: renders a specific conflict banner.
 * On success: calls onSuccess() so parent can close/refresh.
 */
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { MdCalendarToday, MdGroups, MdNotes, MdMeetingRoom, MdSchedule } from 'react-icons/md'
import { bookingService } from '../../services/bookingService'
import { resourceService } from '../../services/resourceService'

// Format a JS Date-like string to the datetime-local input value format
const toLocalInput = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Returns the minimum datetime string for "now" (prevents past bookings)
const nowInput = () => toLocalInput(new Date())

const INITIAL_FORM = {
  resourceId:    '',
  startTime:     '',
  endTime:       '',
  purpose:       '',
  attendeeCount: 1,
}

const BookingForm = ({ onSuccess, onCancel }) => {
  const [form, setForm]         = useState(INITIAL_FORM)
  const [resources, setResources] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors]     = useState({})
  const [conflictMsg, setConflictMsg] = useState('')

  // ── Load available resources for the dropdown ──────────────────
  useEffect(() => {
    resourceService.getAvailable()
      .then(setResources)
      .catch(() => toast.error('Could not load available resources.'))
  }, [])

  // ── Field change handler ──────────────────────────────────────
  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: '' }))
    setConflictMsg('')
  }

  // ── Client-side validation ────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!form.resourceId)    errs.resourceId    = 'Please select a resource.'
    if (!form.startTime)     errs.startTime     = 'Start time is required.'
    if (!form.endTime)       errs.endTime       = 'End time is required.'
    if (!form.purpose.trim()) errs.purpose      = 'Purpose is required.'
    if (form.attendeeCount < 1) errs.attendeeCount = 'At least 1 attendee required.'

    if (form.startTime && form.endTime) {
      const start = new Date(form.startTime)
      const end   = new Date(form.endTime)
      if (end <= start) {
        errs.endTime = 'End time must be after start time.'
      } else if ((end - start) / 60000 < 15) {
        errs.endTime = 'Booking must be at least 15 minutes.'
      }
    }
    return errs
  }

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    setConflictMsg('')

    // Backend expects ISO-8601 LocalDateTime: "2026-05-01T09:00"
    const payload = {
      resourceId:    form.resourceId,
      startTime:     form.startTime,   // datetime-local already gives correct format
      endTime:       form.endTime,
      purpose:       form.purpose.trim(),
      attendeeCount: Number(form.attendeeCount),
    }

    try {
      await bookingService.createBooking(payload)
      toast.success('Booking submitted! It is now awaiting approval.')
      onSuccess?.()
    } catch (err) {
      // Backend sends { errorCode, message } on domain errors
      const code = err?.errorCode || err?.error
      const msg  = err?.message   || 'Failed to create booking.'

      if (code === 'BOOKING_CONFLICT' || code === 'RESOURCE_UNAVAILABLE') {
        setConflictMsg(msg)
      } else {
        toast.error(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  const fieldCls = (key) =>
    `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400 ${
      errors[key] ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* ── Conflict / availability error banner ── */}
      {conflictMsg && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <span className="shrink-0 text-lg">⚠</span>
          <span>{conflictMsg}</span>
        </div>
      )}

      {/* ── Resource selection ── */}
      <div>
        <label htmlFor="bf-resource" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
          <MdMeetingRoom className="text-indigo-500" /> Resource
        </label>
        <select
          id="bf-resource"
          value={form.resourceId}
          onChange={e => set('resourceId', e.target.value)}
          className={fieldCls('resourceId')}
        >
          <option value="">— Select a resource —</option>
          {resources.map(r => (
            <option key={r.id} value={r.id}>
              {r.name} {r.location ? `· ${r.location}` : ''} (cap. {r.capacity ?? '?'})
            </option>
          ))}
        </select>
        {errors.resourceId && <p className="mt-1 text-xs text-red-600">{errors.resourceId}</p>}
      </div>

      {/* ── Start / End time ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="bf-start" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
            <MdSchedule className="text-indigo-500" /> Start Time
          </label>
          <input
            id="bf-start"
            type="datetime-local"
            min={nowInput()}
            value={form.startTime}
            onChange={e => set('startTime', e.target.value)}
            className={fieldCls('startTime')}
          />
          {errors.startTime && <p className="mt-1 text-xs text-red-600">{errors.startTime}</p>}
        </div>
        <div>
          <label htmlFor="bf-end" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
            <MdSchedule className="text-indigo-500" /> End Time
          </label>
          <input
            id="bf-end"
            type="datetime-local"
            min={form.startTime || nowInput()}
            value={form.endTime}
            onChange={e => set('endTime', e.target.value)}
            className={fieldCls('endTime')}
          />
          {errors.endTime && <p className="mt-1 text-xs text-red-600">{errors.endTime}</p>}
        </div>
      </div>

      {/* ── Purpose ── */}
      <div>
        <label htmlFor="bf-purpose" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
          <MdNotes className="text-indigo-500" /> Purpose
        </label>
        <textarea
          id="bf-purpose"
          rows={3}
          placeholder="e.g. Team sprint planning session…"
          value={form.purpose}
          onChange={e => set('purpose', e.target.value)}
          className={fieldCls('purpose') + ' resize-none'}
        />
        {errors.purpose && <p className="mt-1 text-xs text-red-600">{errors.purpose}</p>}
      </div>

      {/* ── Attendees ── */}
      <div>
        <label htmlFor="bf-attendees" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
          <MdGroups className="text-indigo-500" /> Number of Attendees
        </label>
        <input
          id="bf-attendees"
          type="number"
          min={1}
          value={form.attendeeCount}
          onChange={e => set('attendeeCount', e.target.value)}
          className={fieldCls('attendeeCount')}
        />
        {errors.attendeeCount && <p className="mt-1 text-xs text-red-600">{errors.attendeeCount}</p>}
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          id="booking-submit-btn"
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-md shadow-indigo-500/25 hover:-translate-y-0.5 transition-all"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <MdCalendarToday /> Confirm Booking
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default BookingForm
