import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import CommentSection from '../../components/Tickets/CommentSection';
import StatusBadge from '../../components/Tickets/StatusBadge';
import { format } from 'date-fns';
import { MdArrowBack, MdFlag, MdPhone, MdLocationOn, MdImage } from 'react-icons/md';
import { toast } from 'react-toastify';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStaff } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ticketService.getById(id);
      setTicket(data);
    } catch (err) {
      toast.error('Failed to load ticket details');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await ticketService.updateStatus(id, user.userId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchTicket();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="space-y-6 animate-[fadeInAnim_0.3s_ease]">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
          <MdArrowBack className="text-xl text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            {ticket.title} <StatusBadge status={ticket.status} />
          </h2>
          <p className="text-sm text-slate-500 font-medium">Ticket #{ticket.id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Issue Description</h3>
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
            
            {ticket.images && ticket.images.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><MdImage /> Attached Images</h4>
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {ticket.images.map((imgUrl, i) => (
                    <img key={i} src={`http://localhost:8080${imgUrl}`} alt="attachment" className="h-36 w-48 object-cover rounded-xl border border-slate-200 shadow-sm hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0" onClick={() => window.open(`http://localhost:8080${imgUrl}`, '_blank')} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <CommentSection ticketId={ticket.id} comments={ticket.comments} userId={user.userId} onCommentAdded={fetchTicket} />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Details</h3>
            
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</span>
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <MdFlag className={ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'} /> 
                  {ticket.priority}
                </div>
              </div>
              
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</span>
                <div className="font-semibold text-slate-700">{ticket.category}</div>
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</span>
                <div className="flex items-center gap-2 font-medium text-slate-600">
                  <MdLocationOn className="text-slate-400" /> {ticket.location || ticket.resource?.name || '—'}
                </div>
              </div>
              
              {ticket.contactDetails && (
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact</span>
                  <div className="flex items-center gap-2 font-medium text-slate-600">
                    <MdPhone className="text-slate-400" /> {ticket.contactDetails}
                  </div>
                </div>
              )}

              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reporter</span>
                <div className="font-medium text-slate-600">{ticket.createdBy?.name || '—'}</div>
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Timeline</span>
                <div className="text-sm font-medium text-slate-600 space-y-1">
                  <div><span className="text-slate-400 inline-block w-20">Created:</span> {format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}</div>
                  {ticket.updatedAt && <div><span className="text-slate-400 inline-block w-20">Updated:</span> {format(new Date(ticket.updatedAt), 'MMM d, yyyy h:mm a')}</div>}
                  {ticket.resolvedAt && <div><span className="text-slate-400 inline-block w-20">Resolved:</span> {format(new Date(ticket.resolvedAt), 'MMM d, yyyy h:mm a')}</div>}
                </div>
              </div>
            </div>
          </div>

          {isStaff && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Staff Actions</h3>
              <div className="space-y-3">
                {ticket.status === 'OPEN' && (
                  <button onClick={() => handleStatusUpdate('IN_PROGRESS')} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-sm">
                    Mark IN PROGRESS
                  </button>
                )}
                {ticket.status === 'IN_PROGRESS' && (
                  <button onClick={() => handleStatusUpdate('RESOLVED')} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm">
                    Mark RESOLVED
                  </button>
                )}
                {(ticket.status === 'RESOLVED' || ticket.status === 'OPEN') && (
                  <button onClick={() => handleStatusUpdate('CLOSED')} className="w-full py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl shadow-md transition-all text-sm">
                    Close Ticket
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
