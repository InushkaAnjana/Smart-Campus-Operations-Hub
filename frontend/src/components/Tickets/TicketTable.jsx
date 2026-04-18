import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { FiEye, FiUser } from 'react-icons/fi';

/**
 * TicketTable - Displays a list of tickets in a tabular format
 */
const TicketTable = ({ tickets, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500">
        <p className="text-lg font-medium">No tickets found</p>
        <p className="text-sm">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ticket ID</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Category</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Priority</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Assigned</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4 font-mono text-xs text-gray-600">
                #{ticket.id?.slice(-8).toUpperCase()}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{ticket.category}</div>
                <div className="text-xs text-gray-500 truncate max-w-[200px]">{ticket.location}</div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge type="priority" value={ticket.priority} />
              </td>
              <td className="px-6 py-4">
                <StatusBadge type="status" value={ticket.status} />
              </td>
              <td className="px-6 py-4">
                {ticket.assignedToId ? (
                   <div className="flex items-center text-xs text-gray-600">
                    <FiUser className="mr-1" />
                    <span>Technician</span>
                   </div>
                ) : (
                  <span className="text-xs text-red-500 font-medium italic">Unassigned</span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <Link 
                  to={`/tickets/${ticket.id}`}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-all"
                >
                  <FiEye className="mr-1.5" /> View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;
