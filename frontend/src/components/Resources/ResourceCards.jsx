/**
 * ================================================================
 * ResourceCards.jsx — Card Grid View of Campus Resources
 * ================================================================
 * Shown to all authenticated users (USER & ADMIN).
 * Each card shows key info and opens a detail modal on click.
 *
 * Props:
 *   resources  {Array}    list of resource objects
 *   loading    {boolean}  show skeleton cards while loading
 *   onCardClick {Function} called with the resource when card is clicked
 * ================================================================
 */
import { MdMeetingRoom, MdScience, MdComputer, MdLocationOn,
         MdPeople, MdCalendarToday, MdCheckCircle, MdCancel } from 'react-icons/md'

const TYPE_CONFIG = {
  ROOM:      { label: 'Room',      color: 'indigo',  icon: MdMeetingRoom, bg: 'from-indigo-500 to-indigo-700' },
  LAB:       { label: 'Lab',       color: 'emerald', icon: MdScience,     bg: 'from-emerald-500 to-teal-600' },
  EQUIPMENT: { label: 'Equipment', color: 'amber',   icon: MdComputer,    bg: 'from-amber-500 to-orange-600' },
}

const ACCENT = {
  indigo:  { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',  iconBg: 'bg-indigo-50 text-indigo-600' },
  emerald: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', iconBg: 'bg-emerald-50 text-emerald-600' },
  amber:   { badge: 'bg-amber-50 text-amber-700 border-amber-200',     iconBg: 'bg-amber-50 text-amber-600' },
}

// ── Skeleton card while loading ───────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
    <div className="h-1.5 bg-slate-200" />
    <div className="p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-200 rounded w-1/3" />
        </div>
      </div>
      <div className="h-px bg-slate-100" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-200 rounded w-2/3" />
    </div>
  </div>
)

// ── Single Resource Card ──────────────────────────────────────────
const ResourceCard = ({ resource, onClick }) => {
  const typeConf = TYPE_CONFIG[resource.type] || TYPE_CONFIG.ROOM
  const TypeIcon = typeConf.icon
  const accent   = ACCENT[typeConf.color]
  const isActive = resource.status === 'ACTIVE'

  // Parse first availability window
  let availDisplay = null
  if (resource.availabilityWindows && resource.availabilityWindows.length > 0) {
    const parts = resource.availabilityWindows[0].split(' to ')
    if (parts.length === 2) {
      const start = new Date(parts[0]).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
      const end   = new Date(parts[1]).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
      availDisplay = `${start} → ${end}`
    } else {
      availDisplay = resource.availabilityWindows[0]
    }
  }

  return (
    <button
      id={`resource-card-${resource.id}`}
      onClick={() => onClick(resource)}
      className="w-full text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-indigo-400"
    >
      {/* Coloured top accent bar */}
      <div className={`h-1.5 bg-gradient-to-r ${typeConf.bg}`} />

      <div className="p-5">
        {/* Header: icon + name + type badge */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 ${accent.iconBg}`}>
            <TypeIcon className="text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-sm leading-tight truncate group-hover:text-indigo-700 transition-colors">
              {resource.name}
            </h3>
            <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${accent.badge}`}>
              {typeConf.label}
            </span>
          </div>
          {/* Status dot */}
          <div className="flex-shrink-0 mt-0.5">
            {isActive
              ? <MdCheckCircle className="text-emerald-500 text-lg" title="Active" />
              : <MdCancel className="text-red-400 text-lg" title="Out of Service" />
            }
          </div>
        </div>

        <div className="space-y-2">
          {/* Capacity */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MdPeople className="text-slate-400 flex-shrink-0" />
            <span>{resource.capacity ? `${resource.capacity} persons` : 'Capacity not set'}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MdLocationOn className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{resource.location || 'Location not specified'}</span>
          </div>

          {/* Availability */}
          <div className="flex items-start gap-2 text-xs text-slate-500">
            <MdCalendarToday className="text-slate-400 flex-shrink-0 mt-0.5" />
            {availDisplay ? (
              <span className="text-xs font-medium text-indigo-600 truncate">{availDisplay}</span>
            ) : (
              <span className="italic">No availability set</span>
            )}
          </div>
        </div>

        {/* "View details" hint */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 group-hover:text-indigo-500 transition-colors text-right font-medium">
          View details →
        </div>
      </div>
    </button>
  )
}

// ── Main export ───────────────────────────────────────────────────
const ResourceCards = ({ resources = [], loading, onCardClick }) => {

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400">
        <MdMeetingRoom className="text-6xl mb-3 opacity-25" />
        <h3 className="text-base font-semibold text-slate-500">No resources found</h3>
        <p className="text-sm mt-1">Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onClick={onCardClick}
        />
      ))}
    </div>
  )
}

export default ResourceCards
