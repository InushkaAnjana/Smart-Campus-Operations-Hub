import React from 'react';
import { FiFilter, FiSearch } from 'react-icons/fi';

/**
 * TicketFilters - Filter controls for sorting and searching tickets
 */
const TicketFilters = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value || null }));
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
      <div className="flex items-center text-gray-400 mr-2">
        <FiFilter className="mr-2" />
        <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
      </div>

      <select 
        name="status"
        value={filters.status || ''}
        onChange={handleChange}
        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Statuses</option>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
        <option value="CLOSED">Closed</option>
        <option value="REJECTED">Rejected</option>
      </select>

      <select 
        name="priority"
        value={filters.priority || ''}
        onChange={handleChange}
        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Priorities</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>

      <div className="flex-1 min-w-[200px] relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text"
          placeholder="Search location or ID..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default TicketFilters;
