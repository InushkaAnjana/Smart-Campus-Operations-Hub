/**
 * BookingFilters.jsx — Filter bar for the Admin Bookings view
 *
 * Supported filters (all optional, combinable):
 *   status     — dropdown (PENDING | APPROVED | REJECTED | CANCELLED | COMPLETED)
 *   resourceId — free-text input  (matches exact backend resourceId)
 *   date       — date picker      (sends ISO YYYY-MM-DD to backend)
 *
 * The parent calls the onChange callback whenever any filter changes.
 * onChange receives the full filters object so the parent can fire
 * a single getAllBookings(filters) call.
 */
import { useState, useCallback } from 'react'
import { MdSearch, MdFilterList, MdClear, MdCalendarToday } from 'react-icons/md'

const STATUSES = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']

const BookingFilters = ({ filters, onChange, loading }) => {
  const set = (key, val) => onChange({ ...filters, [key]: val })

  const clearAll = () =>
    onChange({ status: '', resourceId: '', date: '' })

  const hasActiveFilters =
    filters.status || filters.resourceId || filters.date

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      {/* ── Status dropdown ── */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <MdFilterList className="text-slate-400 text-xl shrink-0" />
        <select
          id="filter-status"
          value={filters.status}
          onChange={e => set('status', e.target.value)}
          className="flex-1 text-sm border-0 bg-transparent text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map(s => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      <div className="w-px h-6 bg-slate-200 hidden sm:block" />

      {/* ── Resource ID input ── */}
      <div className="relative flex-1">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        <input
          id="filter-resource"
          type="text"
          value={filters.resourceId}
          onChange={e => set('resourceId', e.target.value)}
          placeholder="Filter by Resource ID…"
          className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      {/* ── Date picker ── */}
      <div className="relative">
        <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
        <input
          id="filter-date"
          type="date"
          value={filters.date}
          onChange={e => set('date', e.target.value)}
          className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full sm:w-auto"
        />
      </div>

      {/* ── Clear button ── */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors shrink-0"
        >
          <MdClear /> Clear
        </button>
      )}
    </div>
  )
}

export default BookingFilters
