import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';
import { ticketService } from '../../services/ticketService';
import { toast } from 'react-toastify';

// Must match what TicketForm sends on creation (category is a plain String in Ticket model)
const CATEGORIES = [
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'PLUMBING',   label: 'Plumbing' },
  { value: 'IT_SUPPORT', label: 'IT Support' },
  { value: 'FURNITURE',  label: 'Furniture' },
  { value: 'CLEANING',   label: 'Cleaning' },
  { value: 'OTHER',      label: 'Other' },
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const STATUSES = [
  { value: 'OPEN',        label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED',    label: 'Resolved' },
  { value: 'CLOSED',      label: 'Closed' },
  { value: 'REJECTED',    label: 'Rejected' },
];

/**
 * UpdateTicketModal – Pre-filled edit modal for updating a ticket's key fields.
 * Sends PATCH-style PUT /api/tickets/:id with only the editable fields.
 */
const UpdateTicketModal = ({ ticket, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    category:    '',
    priority:    '',
    status:      '',
    assignedToId:'',
  });
  const [loading, setLoading] = useState(false);

  // Pre-fill when the ticket prop arrives
  useEffect(() => {
    if (ticket) {
      setForm({
        category:     ticket.category     || '',
        priority:     ticket.priority     || '',
        status:       ticket.status       || '',
        assignedToId: ticket.assignedToId || '',
      });
    }
  }, [ticket]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build payload – send only fields that have a value
    // (assignedToId can be blank to mean "unassign")
    const payload = {
      category:     form.category     || undefined,
      priority:     form.priority     || undefined,
      status:       form.status       || undefined,
      // Send the raw string: empty string = unassign (backend handles it)
      assignedToId: form.assignedToId,
    };

    try {
      setLoading(true);
      await ticketService.updateTicket(ticket.id, payload);
      toast.success('Ticket updated successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update ticket.');
    } finally {
      setLoading(false);
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const inputCls =
    'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all';
  const labelCls =
    'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-gray-900">Edit Ticket</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              #{ticket?.id?.slice(-8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-700"
            aria-label="Close modal"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

          {/* Category */}
          <div>
            <label className={labelCls}>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={inputCls}
              required
            >
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className={labelCls}>Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className={inputCls}
              required
            >
              <option value="">Select priority…</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className={labelCls}>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputCls}
              required
            >
              <option value="">Select status…</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Person ID */}
          <div>
            <label className={labelCls}>Assigned Technician ID</label>
            <input
              type="text"
              name="assignedToId"
              value={form.assignedToId}
              onChange={handleChange}
              placeholder="Leave blank to unassign"
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter the technician's user ID, or clear to unassign.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <FiSave size={14} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTicketModal;
