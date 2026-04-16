/**
 * BookingTable.jsx — Reusable table for displaying bookings
 *
 * Props:
 *   bookings  — array of BookingResponse objects
 *   isAdmin   — boolean; controls which action buttons are shown
 *   onApprove(id)          — called when admin clicks Approve
 *   onReject(id)           — called when admin clicks Reject  (opens reason modal in parent)
 *   onCancel(id)           — called when user/admin clicks Cancel
 *   onDelete(id)           — called when admin clicks Delete
 *   actionLoading          — Set<id> of booking IDs currently processing
 *
 * Each row shows:
 *   ID (truncated) | User name | Resource name | Time range | Status | Actions
 */
import { format } from 'date-fns'
import { MdCheck, MdClose, MdCancel, MdDeleteOutline, MdLocationOn } from 'react-icons/md'
import StatusBadge from './StatusBadge'

/**
 * Formats an ISO LocalDateTime string to a readable label.
 * Backend sends e.g. "2026-05-01T09:00:00" — date-fns handles it.
 */
const fmt = (dt) => {
  if (!dt) return '—'
  try { return format(new Date(dt), 'MMM dd, yyyy HH:mm') }
  catch { return dt }
}

const BookingTable = ({
  bookings = [],
  isAdmin = false,
  onApprove,
  onReject,
  onCancel,
  onDelete,
  actionLoading = new Set(),
}) => {
  if (!bookings.length) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {['#', ...(isAdmin ? ['User'] : []), 'Resource', 'Start', 'End', 'Purpose', 'Attendees', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.map((b, i) => {
              const isProcessing = actionLoading.has(b.id)
              // Determine which actions are valid for this row
              const canApprove  = isAdmin && b.status === 'PENDING'
              const canReject   = isAdmin && b.status === 'PENDING'
              const canCancel   = (b.status === 'PENDING' || b.status === 'APPROVED')
              const canDelete   = isAdmin

              return (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Index */}
                  <td className="px-4 py-3.5 text-slate-400 font-medium">{i + 1}</td>

                  {/* User (admin view only) */}
                  {isAdmin && (
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-800 text-sm">{b.user?.name || '—'}</div>
                      <div className="text-xs text-slate-400">{b.user?.email || ''}</div>
                    </td>
                  )}

                  {/* Resource */}
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-800">{b.resource?.name || b.resourceId || '—'}</div>
                    {b.resource?.location && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <MdLocationOn className="text-sm" />{b.resource.location}
                      </div>
                    )}
                  </td>

                  {/* Times */}
                  <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap text-xs">{fmt(b.startTime)}</td>
                  <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap text-xs">
                    {b.endTime ? format(new Date(b.endTime), 'HH:mm') : '—'}
                  </td>

                  {/* Purpose */}
                  <td className="px-4 py-3.5 max-w-[160px]">
                    <span className="block truncate text-slate-600 text-xs">{b.purpose || '—'}</span>
                  </td>

                  {/* Attendees */}
                  <td className="px-4 py-3.5 text-center text-slate-600">{b.attendeeCount ?? '—'}</td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={b.status} />
                    {/* Show rejection reason if REJECTED */}
                    {b.status === 'REJECTED' && b.rejectionReason && (
                      <p className="text-[10px] text-red-500 mt-1 max-w-[140px] truncate" title={b.rejectionReason}>
                        ↳ {b.rejectionReason}
                      </p>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* APPROVE — admin, PENDING only */}
                      {canApprove && (
                        <button
                          id={`approve-booking-${b.id}`}
                          disabled={isProcessing}
                          onClick={() => onApprove?.(b.id)}
                          title="Approve"
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors disabled:opacity-50"
                        >
                          <MdCheck className="text-base" />
                          {isProcessing ? '…' : 'Approve'}
                        </button>
                      )}

                      {/* REJECT — admin, PENDING only */}
                      {canReject && (
                        <button
                          id={`reject-booking-${b.id}`}
                          disabled={isProcessing}
                          onClick={() => onReject?.(b.id)}
                          title="Reject"
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                        >
                          <MdClose className="text-base" />
                          Reject
                        </button>
                      )}

                      {/* CANCEL — user (own) or admin */}
                      {canCancel && (
                        <button
                          id={`cancel-booking-${b.id}`}
                          disabled={isProcessing}
                          onClick={() => onCancel?.(b.id)}
                          title="Cancel"
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors disabled:opacity-50"
                        >
                          <MdCancel className="text-sm" />
                          Cancel
                        </button>
                      )}

                      {/* DELETE — admin only (soft-delete) */}
                      {canDelete && (
                        <button
                          id={`delete-booking-${b.id}`}
                          disabled={isProcessing}
                          onClick={() => onDelete?.(b.id)}
                          title="Delete (soft)"
                          className="flex items-center justify-center w-7 h-7 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <MdDeleteOutline className="text-base" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BookingTable
