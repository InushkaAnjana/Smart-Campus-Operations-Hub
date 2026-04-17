/**
 * ================================================================
 * StatusBadge.jsx — Visual Badge for Resource Status & Availability
 * ================================================================
 * Renders a colour-coded pill badge based on:
 *   - status:      ACTIVE | OUT_OF_SERVICE
 *   - isAvailable: true | false  (secondary indicator)
 *
 * Usage:
 *   <StatusBadge status="ACTIVE" />
 *   <StatusBadge status="OUT_OF_SERVICE" />
 * ================================================================
 */

const STATUS_CONFIG = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  OUT_OF_SERVICE: {
    label: 'Out of Service',
    className: 'bg-red-100 text-red-700 border border-red-200',
    dot: 'bg-red-500',
  },
}

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    className: 'bg-slate-100 text-slate-600 border border-slate-200',
    dot: 'bg-slate-400',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

export default StatusBadge
