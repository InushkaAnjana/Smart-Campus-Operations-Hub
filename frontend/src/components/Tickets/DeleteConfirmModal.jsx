import React, { useState } from 'react';
import { FiAlertTriangle, FiTrash2, FiX, FiLoader } from 'react-icons/fi';
import { ticketService } from '../../services/ticketService';
import { toast } from 'react-toastify';

/**
 * DeleteConfirmModal - Confirmation dialog before permanently deleting a ticket
 */
const DeleteConfirmModal = ({ ticket, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await ticketService.deleteTicket(ticket.id);
      toast.success('Ticket deleted successfully.');
      onSuccess(ticket.id);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete ticket.');
    } finally {
      setLoading(false);
    }
  };

  // Close on backdrop click (only when not loading)
  const handleBackdropClick = (e) => {
    if (!loading && e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-fade-in">
        {/* Icon header */}
        <div className="flex flex-col items-center px-6 pt-8 pb-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <FiAlertTriangle size={28} className="text-red-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Delete Ticket?</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Are you sure you want to delete ticket{' '}
            <span className="font-bold font-mono text-gray-700">
              #{ticket?.id?.slice(-8).toUpperCase()}
            </span>
            ? This action{' '}
            <span className="font-bold text-red-600">cannot be undone</span>.
          </p>
        </div>

        {/* Ticket info strip */}
        <div className="mx-6 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400 font-bold uppercase tracking-wider">Category</span>
            <span className="font-semibold">{ticket?.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 font-bold uppercase tracking-wider">Status</span>
            <span className="font-semibold">{ticket?.status?.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 font-bold uppercase tracking-wider">Priority</span>
            <span className="font-semibold">{ticket?.priority}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-1.5">
              <FiX size={14} /> Cancel
            </span>
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" /> Deleting…
              </>
            ) : (
              <>
                <FiTrash2 size={14} /> Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
