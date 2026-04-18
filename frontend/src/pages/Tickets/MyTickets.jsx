import React, { useEffect, useState, useCallback } from 'react';
import { MdAdd } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import TicketTable from '../../components/Tickets/TicketTable';
import TicketForm from '../../components/Tickets/TicketForm';
import { toast } from 'react-toastify';

const MyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const data = await ticketService.getMyTickets(user.userId);
      setTickets(data);
    } catch (err) {
      toast.error('Failed to load your tickets');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreate = async (formData, images) => {
    try {
      setSubmitting(true);
      await ticketService.create(user.userId, formData, images);
      toast.success('Ticket created successfully!');
      setShowModal(false);
      fetchTickets();
    } catch (err) {
      toast.error('Error creating ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-[fadeInAnim_0.3s_ease]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Tickets</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Track issues you've reported</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-500/30 hover:-translate-y-0.5 transition-all shrink-0"
        >
          <MdAdd className="text-lg" /> Report Issue
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl shadow-sm">
           <div className="text-indigo-600 font-bold text-sm mb-1 uppercase tracking-wide">Total</div>
           <div className="text-3xl font-extrabold text-slate-800">{tickets.length}</div>
        </div>
        <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl shadow-sm">
           <div className="text-orange-600 font-bold text-sm mb-1 uppercase tracking-wide">Open</div>
           <div className="text-3xl font-extrabold text-slate-800">{tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length}</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl shadow-sm">
           <div className="text-emerald-600 font-bold text-sm mb-1 uppercase tracking-wide">Resolved</div>
           <div className="text-3xl font-extrabold text-slate-800">{tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <TicketTable tickets={tickets} />
      )}

      {showModal && (
        <TicketForm onCancel={() => setShowModal(false)} onSubmit={handleCreate} loading={submitting} />
      )}
    </div>
  );
};

export default MyTickets;
