import React from 'react';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';

/**
 * TicketFilters - Fully wired filter controls (status, priority, search text)
 *
 * Props:
 *   filters    – { status, priority, search }
 *   setFilters – state setter from parent
 */
const TicketFilters = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const hasActiveFilters =
    filters.status || filters.priority || filters.search;

  const clearAll = () =>
    setFilters({ status: '', priority: '', search: '' });

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
      {/* Label */}
      <div className="flex items-center text-gray-400 mr-1">
        <FiFilter className="mr-2" size={14} />
        <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
      </div>

      {/* Status dropdown */}
      <select
        name="status"
        value={filters.status || ''}
        onChange={handleChange}
        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
      >
        <option value="">All Statuses</option>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
        <option value="CLOSED">Closed</option>
        <option value="REJECTED">Rejected</option>
      </select>

      {/* Priority dropdown */}
      <select
        name="priority"
        value={filters.priority || ''}
        onChange={handleChange}
        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
      >
        <option value="">All Priorities</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>

      {/* Search box – now fully connected */}
      <div className="flex-1 min-w-[200px] relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <input
          type="text"
          name="search"
          value={filters.search || ''}
          onChange={handleChange}
          placeholder="Search by category, location or ID…"
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {filters.search && (
          <button
            onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX size={13} />
          </button>
        )}
      </div>

      {/* Clear all – only visible when a filter is active */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="px-3 py-2 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all flex items-center gap-1"
        >
          <FiX size={12} /> Clear
        </button>
      )}
    </div>
  );
};

export default TicketFilters;
