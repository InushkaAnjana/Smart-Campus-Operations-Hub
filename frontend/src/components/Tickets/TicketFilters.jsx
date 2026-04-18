import React from 'react';

const STATUS_OPTIONS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
const PRIORITY_OPTIONS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const TicketFilters = ({ filters, setFilters }) => {
  return (
    <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-[fadeInAnim_0.3s_ease]">
      <div className="flex flex-col">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Status</label>
        <select 
          value={filters.status} 
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2.5 outline-none font-semibold cursor-pointer transition-all hover:bg-slate-100 min-w-[140px]"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Priority</label>
        <select 
          value={filters.priority} 
          onChange={(e) => setFilters({...filters, priority: e.target.value})}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2.5 outline-none font-semibold cursor-pointer transition-all hover:bg-slate-100 min-w-[140px]"
        >
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </div>
  );
};

export default TicketFilters;
