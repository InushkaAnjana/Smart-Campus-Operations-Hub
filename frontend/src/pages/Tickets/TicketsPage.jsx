import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import TicketTable from '../../components/Tickets/TicketTable';
import TicketFilters from '../../components/Tickets/TicketFilters';
import { toast } from 'react-toastify';

const TicketsPage = () => {
  const { user, isStaff } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'ALL', priority: 'ALL' });

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAll(filters);
      setTickets(data);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  if (!isStaff) {
    return <div className="p-10 text-center text-red-500 font-bold">Access Denied. Admins and Technicians only.</div>;
  }

  return (
    <div className="space-y-6 animate-[fadeInAnim_0.3s_ease]">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">All Tickets</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage and assign facility maintenance tickets</p>
      </div>

      <TicketFilters filters={filters} setFilters={setFilters} />

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <TicketTable tickets={tickets} />
      )}
    </div>
  );
};

export default TicketsPage;
