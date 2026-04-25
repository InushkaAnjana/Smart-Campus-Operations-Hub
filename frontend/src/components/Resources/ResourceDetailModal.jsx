/**
 * ================================================================
 * ResourceDetailModal.jsx — Full Detail View for a Single Resource
 * ================================================================
 * Shown when a USER clicks a resource card.
 * Displays all fields including Availability Start/End.
 *
 * Props:
 *   resource  {Object}   the resource object to display
 *   onClose   {Function} close the modal
 * ================================================================
 */
import { MdClose, MdMeetingRoom, MdScience, MdComputer, MdLocationOn,
         MdPeople, MdCalendarToday, MdCircle, MdDescription, MdAccessTime } from 'react-icons/md'

const TYPE_CONFIG = {
  ROOM:      { label: 'Room',      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',   icon: MdMeetingRoom },
  LAB:       { label: 'Lab',       color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: MdScience },
  EQUIPMENT: { label: 'Equipment', color: 'text-amber-600 bg-amber-50 border-amber-200',       icon: MdComputer },
}

const formatDateTime = (dt) => {
  if (!dt) return null
  return new Date(dt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

const ResourceDetailModal = ({ resource, onClose }) => {
  if (!resource) return null

  const typeConf = TYPE_CONFIG[resource.type] || TYPE_CONFIG.ROOM
  const TypeIcon = typeConf.icon
  const isActive = resource.status === 'ACTIVE'

  // Parse availability windows stored as "start to end"
  const availParsed = (resource.availabilityWindows || []).map((win, idx) => {
    const parts = win.split(' to ')
    if (parts.length === 2) {
      return { start: formatDateTime(parts[0]), end: formatDateTime(parts[1]), raw: win, key: idx }
    }
    return { start: null, end: null, raw: win, key: idx }
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">

        {/* ── Header ── */}
        <div className={`relative px-6 pt-6 pb-8 bg-gradient-to-br from-indigo-600 to-violet-600`}>
          <button
            id="close-detail-modal"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors"
          >
            <MdClose className="text-lg" />
          </button>

          {/* Type icon + badge */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 text-white text-2xl shadow">
              <TypeIcon />
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-white/10 text-white border-white/20`}>
              {typeConf.label}
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white leading-tight">{resource.name}</h2>
          {resource.description && (
            <p className="text-sm text-indigo-200 mt-1 line-clamp-2">{resource.description}</p>
          )}
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">

          {/* Status */}
          <div className="flex items-center gap-2">
            <MdCircle className={`text-xs ${isActive ? 'text-emerald-500' : 'text-red-500'}`} />
            <span className={`text-sm font-semibold ${isActive ? 'text-emerald-700' : 'text-red-600'}`}>
              {isActive ? 'Active' : 'Out of Service'}
            </span>
            {resource.isAvailable && (
              <span className="ml-auto text-xs font-medium px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Available to Book
              </span>
            )}
          </div>

          <div className="w-full h-px bg-slate-100" />

          {/* Capacity & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0 mt-0.5">
                <MdPeople className="text-base" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium mb-0.5">Capacity</div>
                <div className="text-sm font-semibold text-slate-800">
                  {resource.capacity ? `${resource.capacity} persons` : '—'}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex-shrink-0 mt-0.5">
                <MdLocationOn className="text-base" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium mb-0.5">Location</div>
                <div className="text-sm font-semibold text-slate-800">
                  {resource.location || <span className="italic text-slate-400">Not specified</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="w-full h-px bg-slate-100" />
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex-shrink-0">
                <MdCalendarToday className="text-base" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Availability</span>
            </div>

            {availParsed.length > 0 ? (
              <div className="space-y-2">
                {availParsed.map((win) => (
                  win.start ? (
                    <div key={win.key} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-2 flex-1">
                        <MdAccessTime className="text-emerald-500 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-slate-400 font-medium">Start</div>
                          <div className="text-sm font-semibold text-emerald-700">{win.start}</div>
                        </div>
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-slate-200" />
                      <div className="flex items-center gap-2 flex-1">
                        <MdAccessTime className="text-rose-500 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-slate-400 font-medium">End</div>
                          <div className="text-sm font-semibold text-rose-600">{win.end}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span key={win.key} className="inline-block text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                      {win.raw}
                    </span>
                  )
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400 italic bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                No availability window set for this resource.
              </div>
            )}
          </div>

          {/* Description (full) */}
          {resource.description && (
            <>
              <div className="w-full h-px bg-slate-100" />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex-shrink-0">
                    <MdDescription className="text-base" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Description</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{resource.description}</p>
              </div>
            </>
          )}

          {/* Audit timestamps */}
          {resource.createdAt && (
            <div className="text-xs text-slate-400 pt-1 border-t border-slate-100">
              Added on {new Date(resource.createdAt).toLocaleDateString([], { dateStyle: 'long' })}
              {resource.updatedAt && resource.updatedAt !== resource.createdAt && (
                <span> · Updated {new Date(resource.updatedAt).toLocaleDateString([], { dateStyle: 'long' })}</span>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            id="close-detail-modal-btn"
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResourceDetailModal
