import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import TicketTable from '../../components/Tickets/TicketTable';
import TicketFilters from '../../components/Tickets/TicketFilters';
import UpdateTicketModal from '../../components/Tickets/UpdateTicketModal';
import DeleteConfirmModal from '../../components/Tickets/DeleteConfirmModal';
import { FiRefreshCcw, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

/**
 * TicketsPage - Main administrative view for all tickets
 *
 * Filtering strategy:
 *  - Fetch ALL tickets for the current user/role from the API (no server-side params).
 *  - Apply status, priority, and search filters CLIENT-SIDE so they always work
 *    regardless of whether the user is ADMIN or not.
 *  - Stats cards always count against ALL tickets (not the filtered subset).
 */
const TicketsPage = () => {
  const { user, isAdmin, isStaff } = useAuth();

  // ── Raw data from API ────────────────────────────────────────────────────
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Filter state ─────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    status:   '',
    priority: '',
    search:   '',
  });

  // ── Modal state ──────────────────────────────────────────────────────────
  const [editingTicket, setEditingTicket] = useState(null);
  const [deletingTicket, setDeletingTicket] = useState(null);

  // ── Fetch (no filter params – filtering is done client-side) ─────────────
  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Pass no params so the backend returns everything for this user/role.
      const data = await ticketService.getAllTickets({});
      setAllTickets(data);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []); // fetch once; filtering is local

  // ── Client-side filtering ────────────────────────────────────────────────
  const filteredTickets = useMemo(() => {
    let result = allTickets;

    if (filters.status) {
      result = result.filter((t) => t.status === filters.status);
    }

    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }

    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.id?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.location?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allTickets, filters]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleUpdateSuccess = () => fetchTickets();

  const handleDeleteSuccess = (deletedId) => {
    setAllTickets((prev) => prev.filter((t) => t.id !== deletedId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Maintenance Hub</h1>
          <p className="text-gray-500 text-sm">
            {isAdmin
              ? 'Overview of all active campus incidents and maintenance requests.'
              : 'Overview of your maintenance requests and incident reports.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTickets}
            title="Refresh"
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

      {/* Stats – always based on ALL tickets, not the filtered subset */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open',         color: 'yellow', count: allTickets.filter((t) => t.status === 'OPEN').length },
          { label: 'In Progress',  color: 'blue',   count: allTickets.filter((t) => t.status === 'IN_PROGRESS').length },
          { label: 'Resolved',     color: 'green',  count: allTickets.filter((t) => t.status === 'RESOLVED').length },
          { label: 'High Priority',color: 'red',    count: allTickets.filter((t) => t.priority === 'HIGH').length },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className={`text-2xl font-black text-${stat.color}-600`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Filters – fully client-side */}
      <TicketFilters filters={filters} setFilters={setFilters} />

      {/* Result count hint */}
      {(filters.status || filters.priority || filters.search) && (
        <p className="text-xs text-gray-400 -mt-2 pl-1">
          Showing{' '}
          <span className="font-bold text-gray-600">{filteredTickets.length}</span> of{' '}
          <span className="font-bold text-gray-600">{allTickets.length}</span> tickets
        </p>
      )}

      {/* Main Table – receives the filtered subset */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
        <TicketTable
          tickets={filteredTickets}
          loading={loading}
          onUpdate={setEditingTicket}
          onDelete={setDeletingTicket}
        />
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {editingTicket && (
        <UpdateTicketModal
          ticket={editingTicket}
          onClose={() => setEditingTicket(null)}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {deletingTicket && (
        <DeleteConfirmModal
          ticket={deletingTicket}
          onClose={() => setDeletingTicket(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default TicketsPage;
