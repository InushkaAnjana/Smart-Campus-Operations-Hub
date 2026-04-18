import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import TicketForm from '../../components/Tickets/TicketForm';
import TicketTable from '../../components/Tickets/TicketTable';
import { FiPlus, FiList } from 'react-icons/fi';
import { toast } from 'react-toastify';

/**
 * MyTickets - User dashboard for reporting incidents and tracking them
 */
const MyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'create'

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getMyTickets();
      setTickets(data);
    } catch (error) {
      toast.error("Failed to load your tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Support Requests</h1>
          <p className="text-gray-500">Report maintenance issues or track your raised tickets.</p>
        </div>
        
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button 
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${view === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            <FiList /> My History
          </button>
          <button 
            onClick={() => setView('create')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${view === 'create' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            <FiPlus /> New Ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {view === 'create' ? (
          <div className="lg:col-span-8 lg:col-start-3">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800">Report an Incident</h2>
                <p className="text-sm text-gray-400">Please provide as much detail as possible for faster resolution.</p>
              </div>
              <TicketForm onSuccess={() => {
                setView('list');
                fetchMyTickets();
              }} />
            </div>
          </div>
        ) : (
          <div className="lg:col-span-12">
            <TicketTable tickets={tickets} loading={loading} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
