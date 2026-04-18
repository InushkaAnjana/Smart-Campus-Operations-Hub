import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdFlag, MdBuild } from 'react-icons/md';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';

const PRIORITY_STYLE = {
  LOW:      { cls: 'bg-blue-100 text-blue-700' },
  MEDIUM:   { cls: 'bg-amber-100 text-amber-800' },
  HIGH:     { cls: 'bg-orange-100 text-orange-700' },
  CRITICAL: { cls: 'bg-red-100 text-red-700' },
};

const TicketTable = ({ tickets }) => {
  const navigate = useNavigate();

  if (!tickets || tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <MdBuild className="text-4xl text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-1">No tickets found</h3>
        <p className="text-sm font-medium text-slate-500">There are no tickets matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-[fadeInAnim_0.4s_ease]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              {['ID', 'Title', 'Location', 'Priority', 'Status', 'Created', 'Action'].map(h => (
                <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tickets.map((ticket) => {
              const pStyle = PRIORITY_STYLE[ticket.priority] || PRIORITY_STYLE.LOW;
              return (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-indigo-50/50 transition-colors cursor-pointer group" 
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <td className="px-6 py-4.5 text-slate-400 font-semibold text-xs">#{ticket.id.slice(-4).toUpperCase()}</td>
                  <td className="px-6 py-4.5 max-w-[200px]">
                    <div className="font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{ticket.title}</div>
                    <div className="text-xs text-slate-500 mt-1 truncate font-medium">{ticket.category}</div>
                  </td>
                  <td className="px-6 py-4.5 text-slate-700 font-medium">{ticket.location || ticket.resource?.name || '—'}</td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold tracking-wide ${pStyle.cls}`}>
                      <MdFlag className="text-sm opacity-70" /> {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4.5">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-6 py-4.5 text-slate-500 whitespace-nowrap text-sm font-medium">
                    {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM dd, yyyy') : '—'}
                  </td>
                  <td className="px-6 py-4.5">
                    <button className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold text-sm bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                      View <span className="text-lg leading-none">→</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketTable;
