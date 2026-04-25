import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { FiEye, FiUser, FiEdit2, FiTrash2 } from 'react-icons/fi';

/**
 * TicketTable - Displays a list of tickets in a tabular format
 * Props:
 *   tickets   - array of ticket objects
 *   loading   - boolean skeleton loader flag
 *   onUpdate  - (ticket) => void  – opens UpdateTicketModal
 *   onDelete  - (ticket) => void  – opens DeleteConfirmModal
 */
const TicketTable = ({ tickets, loading, onUpdate, onDelete }) => {
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
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {tickets.map((ticket) => {
            const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';

            return (
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
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {/* View */}
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-all"
                      title="View details"
                    >
                      <FiEye className="mr-1.5" /> View
                    </Link>

                    {/* Update */}
                    {onUpdate && (
                      <button
                        onClick={() => onUpdate(ticket)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-all border border-blue-100"
                        title="Edit ticket"
                      >
                        <FiEdit2 className="mr-1.5" size={11} /> Edit
                      </button>
                    )}

                    {/* Delete — disabled when RESOLVED or CLOSED */}
                    {onDelete && (
                      <button
                        onClick={() => !isResolved && onDelete(ticket)}
                        disabled={isResolved}
                        title={isResolved ? 'Cannot delete a resolved/closed ticket' : 'Delete ticket'}
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg transition-all border ${
                          isResolved
                            ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                            : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100'
                        }`}
                      >
                        <FiTrash2 className="mr-1.5" size={11} /> Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;
