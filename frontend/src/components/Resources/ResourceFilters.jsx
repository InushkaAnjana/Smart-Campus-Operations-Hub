/**
 * ================================================================
 * ResourceFilters.jsx — Filter Bar for Facilities & Assets
 * ================================================================
 * Renders four filter controls:
 *   1. Type dropdown     → ROOM | LAB | EQUIPMENT
 *   2. Min Capacity      → number input
 *   3. Location          → text search (partial match)
 *   4. Status dropdown   → ACTIVE | OUT_OF_SERVICE
 *
 * Props:
 *   filters  {Object}   current filter state from ResourcesPage
 *   onChange {Function} called with the updated filters object
 *   onApply  {Function} called when user clicks "Apply Filters"
 *   onReset  {Function} called when user clicks "Reset"
 *
 * FILTERING LOGIC:
 *   - Filters are stored in ResourcesPage state and passed here.
 *   - onChange updates the parent state immediately (controlled).
 *   - onApply triggers the actual API call (avoids spamming on every keystroke).
 *   - Empty/null values are stripped by resourceService.getResources()
 *     before the request is sent.
 * ================================================================
 */
import { MdFilterList, MdRefresh, MdSearch } from 'react-icons/md'

const TYPES   = ['ROOM', 'LAB', 'EQUIPMENT']
const STATUSES = ['ACTIVE', 'OUT_OF_SERVICE']

const ResourceFilters = ({ filters, onChange, onApply, onReset }) => {
  const handleChange = (key, value) => {
    // Notify parent of the single field change
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
          <MdFilterList className="text-indigo-500 text-lg" />
          Filter Resources
        </div>
        <button
          id="reset-filters-btn"
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <MdRefresh className="text-base" /> Reset
        </button>
      </div>

      {/* Filter grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">

        {/* ── Type ── */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Type</label>
          <select
            id="filter-type"
            value={filters.type || ''}
            onChange={e => handleChange('type', e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="">All Types</option>
            {TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>

        {/* ── Min Capacity ── */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Min Capacity</label>
          <input
            id="filter-capacity"
            type="number"
            min="1"
            value={filters.capacity || ''}
            onChange={e => handleChange('capacity', e.target.value ? Number(e.target.value) : '')}
            placeholder="e.g. 50"
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* ── Location ── */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Location</label>
          <div className="relative">
            <MdSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              id="filter-location"
              type="text"
              value={filters.location || ''}
              onChange={e => handleChange('location', e.target.value)}
              placeholder="e.g. Block A"
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* ── Status ── */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</label>
          <select
            id="filter-status"
            value={filters.status || ''}
            onChange={e => handleChange('status', e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {s === 'OUT_OF_SERVICE' ? 'Out of Service' : 'Active'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Apply button */}
      <div className="flex justify-end">
        <button
          id="apply-filters-btn"
          onClick={onApply}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-500/20 hover:-translate-y-0.5 transition-all"
        >
          <MdFilterList /> Apply Filters
        </button>
      </div>
    </div>
  )
}

export default ResourceFilters
