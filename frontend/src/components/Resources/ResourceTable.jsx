/**
 * ================================================================
 * ResourceTable.jsx — Tabular List of Campus Resources
 * ================================================================
 * Displays resources in a responsive table with:
 *   - Name, Type badge, Capacity, Location, Status badge
 *   - Edit / Delete action buttons (ADMIN only)
 *
 * Props:
 *   resources  {Array}    list of ResourceResponseDTO objects
 *   isAdmin    {boolean}  show action buttons when true
 *   onEdit     {Function} called with resource object when Edit is clicked
 *   onDelete   {Function} called with resource id when Delete is clicked
 *   loading    {boolean}  show spinner overlay when true
 *
 * DESIGN:
 *   - Sticky header row
 *   - Alternating row hover highlight
 *   - Type label with coloured left-border accent
 *   - StatusBadge for the status column
 *   - Empty state with an illustration message
 * ================================================================
 */
import { MdEdit, MdDelete, MdMeetingRoom, MdScience, MdComputer, MdLocationOn, MdPeople, MdCalendarToday } from 'react-icons/md'
import StatusBadge from './StatusBadge'

const TYPE_CONFIG = {
  ROOM:      { label: 'Room',         color: 'text-indigo-600 bg-indigo-50  border-indigo-200', icon: MdMeetingRoom },
  LAB:       { label: 'Lab',          color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: MdScience },
  EQUIPMENT: { label: 'Equipment',    color: 'text-amber-600  bg-amber-50   border-amber-200',  icon: MdComputer },
}

const ResourceTable = ({ resources = [], isAdmin, onEdit, onDelete, loading, onCardClick }) => {

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400">
        <MdMeetingRoom className="text-6xl mb-3 opacity-25" />
        <h3 className="text-base font-semibold text-slate-500">No resources found</h3>
        <p className="text-sm mt-1">Try adjusting your filters or add a new resource.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* ── Header ── */}
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Resource</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <span className="flex items-center gap-1"><MdPeople className="text-base" /> Capacity</span>
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <span className="flex items-center gap-1"><MdLocationOn className="text-base" /> Location</span>
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <span className="flex items-center gap-1"><MdCalendarToday className="text-base" /> Availability</span>
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              {isAdmin && (
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              )}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody className="divide-y divide-slate-100">
            {resources.map((resource) => {
              const typeConf = TYPE_CONFIG[resource.type] || TYPE_CONFIG.ROOM
              const TypeIcon = typeConf.icon

              return (
                <tr
                  key={resource.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Name + description — click to open detail modal */}
                  <td className="px-5 py-4 max-w-[200px]">
                    <button
                      onClick={() => onCardClick && onCardClick(resource)}
                      className="text-left group/name w-full"
                      title="View details"
                    >
                      <div className="font-semibold text-slate-800 truncate group-hover/name:text-indigo-600 transition-colors">{resource.name}</div>
                      {resource.description && (
                        <div className="text-xs text-slate-400 truncate mt-0.5">{resource.description}</div>
                      )}
                    </button>
                  </td>

                  {/* Type badge */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeConf.color}`}>
                      <TypeIcon className="text-sm" />
                      {typeConf.label}
                    </span>
                  </td>

                  {/* Capacity */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="font-medium text-slate-700">{resource.capacity ?? '—'}</span>
                  </td>

                  {/* Location */}
                  <td className="px-5 py-4">
                    <span className="text-slate-600 text-xs">
                      {resource.location || <span className="text-slate-400 italic">Not specified</span>}
                    </span>
                  </td>

                  {/* Availability */}
                  <td className="px-5 py-4">
                    {resource.availabilityWindows && resource.availabilityWindows.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {resource.availabilityWindows.map((win, idx) => {
                          const parts = win.split(' to ')
                          if (parts.length === 2) {
                            return (
                              <div key={idx} className="flex items-center text-xs whitespace-nowrap bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100 w-max">
                                <div className="flex items-center gap-1.5 font-medium text-emerald-600 pr-2 border-r border-slate-200">
                                  {new Date(parts[0]).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </div>
                                <div className="flex items-center gap-1.5 font-medium text-rose-600 pl-2">
                                  {new Date(parts[1]).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </div>
                              </div>
                            )
                          }
                          // Fallback for old comma-separated strings
                          return <span key={idx} className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 inline-block">{win}</span>
                        })}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Not set</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <StatusBadge status={resource.status} />
                  </td>

                  {/* ADMIN actions */}
                  {isAdmin && (
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          id={`edit-resource-${resource.id}`}
                          onClick={() => onEdit(resource)}
                          title="Edit resource"
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 transition-all"
                        >
                          <MdEdit className="text-base" />
                        </button>
                        <button
                          id={`delete-resource-${resource.id}`}
                          onClick={() => onDelete(resource.id, resource.name)}
                          title="Delete resource"
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 transition-all"
                        >
                          <MdDelete className="text-base" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer — row count */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-700">{resources.length}</span> resource{resources.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

export default ResourceTable
