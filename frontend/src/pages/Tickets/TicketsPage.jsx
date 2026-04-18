import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import TicketTable from '../../components/Tickets/TicketTable';
import TicketFilters from '../../components/Tickets/TicketFilters';
import { FiRefreshCcw, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

/**
 * TicketsPage - Main administrative view for all tickets
 */
const TicketsPage = () => {
  const { user, isAdmin, isStaff } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: null,
    priority: null,
    assignedTo: null
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAllTickets(filters);
      setTickets(data);
    } catch (error) {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Maintenance Hub</h1>
          <p className="text-gray-500 text-sm">Overview of all active campus incidents and maintenance requests.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchTickets}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
          >
            <FiRefreshCcw className={loading ? 'animate-spin' : ''} />
          </button>
          <Link 
            to="/tickets/my"
            className="px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <FiPlus size={20} />
            New Ticket
          </Link>
        </div>
      </div>

      {/* Stats Quick View (Mock) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open', color: 'yellow', count: tickets.filter(t => t.status === 'OPEN').length },
          { label: 'In Progress', color: 'blue', count: tickets.filter(t => t.status === 'IN_PROGRESS').length },
          { label: 'Resolved', color: 'green', count: tickets.filter(t => t.status === 'RESOLVED').length },
          { label: 'High Priority', color: 'red', count: tickets.filter(t => t.priority === 'HIGH').length },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className={`text-2xl font-black text-${stat.color}-600`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <TicketFilters filters={filters} setFilters={setFilters} />

      {/* Main List */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
        <TicketTable tickets={tickets} loading={loading} />
      </div>
    </div>
  );
};

export default TicketsPage;
