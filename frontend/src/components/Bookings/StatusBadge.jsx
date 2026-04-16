/**
 * StatusBadge.jsx — Reusable booking status pill
 * Statuses: PENDING | APPROVED | REJECTED | CANCELLED | COMPLETED | DELETED
 */
const STATUS_CONFIG = {
  PENDING:   { cls: 'bg-amber-100 text-amber-800 ring-amber-300',   dot: 'bg-amber-400',   label: 'Pending'   },
  APPROVED:  { cls: 'bg-emerald-100 text-emerald-800 ring-emerald-300', dot: 'bg-emerald-500', label: 'Approved'  },
  REJECTED:  { cls: 'bg-red-100 text-red-700 ring-red-300',         dot: 'bg-red-500',     label: 'Rejected'  },
  CANCELLED: { cls: 'bg-slate-100 text-slate-600 ring-slate-300',   dot: 'bg-slate-400',   label: 'Cancelled' },
  COMPLETED: { cls: 'bg-blue-100 text-blue-700 ring-blue-300',      dot: 'bg-blue-500',    label: 'Completed' },
  DELETED:   { cls: 'bg-gray-100 text-gray-500 ring-gray-200',      dot: 'bg-gray-400',    label: 'Deleted'   },
}

const StatusBadge = ({ status, size = 'md' }) => {
  const cfg = STATUS_CONFIG[status?.toUpperCase()] || STATUS_CONFIG.PENDING
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'
  const px       = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide rounded-full ring-1 ring-inset ${cfg.cls} ${textSize} ${px}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export default StatusBadge
