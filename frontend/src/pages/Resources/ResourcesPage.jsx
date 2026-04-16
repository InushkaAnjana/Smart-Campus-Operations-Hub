/**
 * ResourcesPage.jsx - Facilities & Resources Module (Modern Tailwind UI)
 */
import { useEffect, useState } from 'react'
import { MdAdd, MdSearch, MdMeetingRoom, MdComputer, MdScience, MdLocationOn, MdPeople, MdEdit, MdDelete, MdCalendarToday } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import useApi from '../../hooks/useApi'
import { resourceService } from '../../services/resourceService'

const TYPE_ICONS = {
  ROOM:      { icon: MdMeetingRoom, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  LAB:       { icon: MdScience,     color: 'text-emerald-600',bg: 'bg-emerald-50' },
  EQUIPMENT: { icon: MdComputer,    color: 'text-amber-600',  bg: 'bg-amber-50' },
}

const ResourcesPage = () => {
  const { isAdmin } = useAuth()
  const { data: resources, loading, error, execute: fetchResources } = useApi(resourceService.getAll)
  const [search, setSearch]       = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [availOnly, setAvailOnly]   = useState(false)

  useEffect(() => { fetchResources() }, [])

  const filtered = (resources || []).filter(r => {
    if (typeFilter !== 'ALL' && r.type !== typeFilter) return false
    if (availOnly && !r.isAvailable) return false
    if (search && !r.name?.toLowerCase().includes(search.toLowerCase()) &&
        !r.location?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-5 animate-[fadeInAnim_0.2s_ease]">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Facilities & Resources</h2>
          <p className="text-sm text-slate-500 mt-0.5">Browse and manage all campus facilities</p>
        </div>
        {isAdmin && (
          <button
            id="add-resource-btn"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/25 hover:-translate-y-0.5 transition-all"
          >
            <MdAdd className="text-xl" /> Add Resource
          </button>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            id="resource-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or location…"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        {/* Type filter */}
        <select
          id="resource-type-filter"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        >
          <option value="ALL">All Types</option>
          <option value="ROOM">Rooms</option>
          <option value="LAB">Labs</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>
        {/* Available toggle */}
        <label className="flex items-center gap-2 cursor-pointer shrink-0 select-none">
          <div
            onClick={() => setAvailOnly(p => !p)}
            className={`relative w-10 h-5 rounded-full transition-colors ${availOnly ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${availOnly ? 'translate-x-5' : ''}`} />
          </div>
          <span className="text-sm text-slate-600 font-medium">Available only</span>
        </label>
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

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <MdMeetingRoom className="text-6xl mb-3 opacity-30" />
          <h3 className="text-base font-semibold text-slate-600">No resources found</h3>
          <p className="text-sm mt-1">Try adjusting your filters or add a new resource.</p>
        </div>
      )}

      {/* Resource Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(resource => (
            <ResourceCard key={resource.id} resource={resource} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  )
}

const ResourceCard = ({ resource, isAdmin }) => {
  const typeInfo = TYPE_ICONS[resource.type] || TYPE_ICONS.ROOM
  const Icon = typeInfo.icon

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.07)] hover:shadow-[0_4px_12px_-2px_rgba(79,70,229,0.15)] hover:-translate-y-1 transition-all duration-200 overflow-hidden">
      {/* Card top accent */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${resource.isAvailable ? 'from-emerald-400 to-teal-500' : 'from-red-400 to-rose-500'}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${typeInfo.bg} ${typeInfo.color} text-2xl shadow-sm`}>
            <Icon />
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            resource.isAvailable
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-red-100 text-red-700'
          }`}>
            {resource.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Name & type */}
        <div className="mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{resource.type || 'RESOURCE'}</span>
          <h3 className="text-base font-bold text-slate-800 mt-0.5 leading-tight">{resource.name}</h3>
        </div>

        {/* Meta */}
        <div className="space-y-1 mt-3 mb-4">
          {resource.location && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MdLocationOn className="text-sm shrink-0 text-slate-400" />
              {resource.location}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MdPeople className="text-sm shrink-0 text-slate-400" />
            Capacity: <span className="font-semibold text-slate-700">{resource.capacity || '—'}</span>
          </div>
        </div>

        {resource.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{resource.description}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <button
            id={`book-resource-${resource.id}`}
            className="flex items-center gap-1.5 flex-1 justify-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all hover:shadow-md hover:shadow-indigo-500/25"
          >
            <MdCalendarToday className="text-sm" /> Book Now
          </button>
          {isAdmin && (
            <>
              <button id={`edit-resource-${resource.id}`} className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors text-base">
                <MdEdit />
              </button>
              <button id={`delete-resource-${resource.id}`} className="flex items-center justify-center w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors text-base">
                <MdDelete />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResourcesPage
