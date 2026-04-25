import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import StatusBadge from '../../components/Tickets/StatusBadge';
import CommentSection from '../../components/Tickets/CommentSection';
import { FiArrowLeft, FiClock, FiMapPin, FiPhone, FiCheckCircle, FiXCircle, FiPlay, FiSmile } from 'react-icons/fi';
import { toast } from 'react-toastify';
import moment from 'moment';

/**
 * TicketDetails - Deep dive into a single ticket with workflow actions
 */
const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isStaff } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getTicketById(id);
      setTicket(data);
    } catch (error) {
      toast.error("Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleUpdateStatus = async (status, reason = '') => {
    try {
      setActionLoading(true);
      await ticketService.updateStatus(id, status, reason);
      toast.success(`Status updated to ${status}`);
      fetchTicket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Status update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      setActionLoading(true);
      await ticketService.assignTechnician(id, user.id);
      toast.success("Ticket assigned to you");
      fetchTicket();
    } catch (error) {
      toast.error("Assignment failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading details...</div>;
  if (!ticket) return <div className="p-8 text-center">Ticket not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Back & Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-gray-600 font-medium transition-colors">
          <FiArrowLeft className="mr-2" /> Back to list
        </button>
        <div className="flex items-center gap-3">
          <StatusBadge type="status" value={ticket.status} />
          <StatusBadge type="priority" value={ticket.priority} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content (Info & Images) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h1 className="text-2xl font-black text-gray-900 mb-4">{ticket.category} Maintenance</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center text-gray-500 text-sm">
                <FiMapPin className="mr-2 text-blue-500" /> {ticket.location}
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <FiClock className="mr-2 text-blue-500" /> Reported {moment(ticket.createdAt).calendar()}
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <FiPhone className="mr-2 text-blue-500" /> {ticket.contactDetails}
              </div>
              {ticket.resourceId && (
                <div className="flex items-center text-gray-500 text-sm">
                  <span className="font-bold mr-2 text-blue-500">TAG:</span> {ticket.resourceId}
                </div>
              )}
            </div>

            <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-xl mb-8">
              <p>{ticket.description}</p>
            </div>

            {/* Images Gallery */}
            {ticket.imageAttachments && ticket.imageAttachments.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 text-sm">Attachments</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {ticket.imageAttachments.map((img, i) => (
                    <a
                      key={i}
                      href={`/api/files/tickets/${img}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:opacity-90 transition-opacity block"
                    >
                      <img
                        src={`/api/files/tickets/${img}`}
                        alt={`Attachment ${i + 1}`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <CommentSection 
            ticketId={id} 
            comments={ticket.comments} 
            onCommentAdded={fetchTicket} 
            currentUserId={user?.id}
          />
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Workflow Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
               Workflow Management
            </h3>

            {(isAdmin || isStaff) && !ticket.assignedToId && (
              <button 
                onClick={handleAssignToMe}
                disabled={actionLoading}
                className="w-full mb-4 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                Assign to Me
              </button>
            )}

            <div className="space-y-3">
              {/* Transitions based on status */}
              {ticket.status === 'OPEN' && (isAdmin || isStaff) && (
                <>
                  <button 
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-gray-100 flex items-center justify-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <FiPlay /> Start Progress
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => {
                        const reason = prompt("Enter rejection reason:");
                        if (reason) handleUpdateStatus('REJECTED', reason);
                      }}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-gray-100 flex items-center justify-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <FiXCircle /> Reject Ticket
                    </button>
                  )}
                </>
              )}

              {ticket.status === 'IN_PROGRESS' && (isAdmin || isStaff) && (
                <button 
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-green-100 flex items-center justify-center gap-2 text-sm font-bold text-green-700 hover:bg-green-200 rounded-xl transition-all"
                >
                  <FiCheckCircle /> Mark Resolved
                </button>
              )}

              {(ticket.status === 'RESOLVED' || (ticket.status === 'OPEN' && isAdmin)) && (
                <button 
                  onClick={() => handleUpdateStatus('CLOSED')}
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-gray-800 flex items-center justify-center gap-2 text-sm font-bold text-white hover:bg-black rounded-xl transition-all"
                >
                  <FiSmile /> Close Ticket
                </button>
              )}
            </div>

            {ticket.rejectionReason && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs font-bold text-red-500 mb-1 uppercase tracking-widest">Rejection Reason</p>
                <p className="text-sm text-red-700 italic">"{ticket.rejectionReason}"</p>
              </div>
            )}
          </div>

          {/* User Info Card */}
          <div className="bg-gray-900 p-6 rounded-3xl text-white">
            <h4 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-tighter">Reporter Details</h4>
            <div className="space-y-1">
               <p className="font-bold">{ticket.createdById || 'Anonymous User'}</p>
               <p className="text-xs text-white/50">User ID: #{ticket.id?.slice(0,6)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
