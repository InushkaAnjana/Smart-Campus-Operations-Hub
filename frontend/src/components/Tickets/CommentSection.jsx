import React, { useState } from 'react';
import { FiMessageSquare, FiSend, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { ticketService } from '../../services/ticketService';
import { toast } from 'react-toastify';
import moment from 'moment';

/**
 * CommentSection - Interactive comment thread for tickets
 */
const CommentSection = ({ ticketId, comments, onCommentAdded, currentUserId }) => {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await ticketService.addComment(ticketId, { message: newComment });
      setNewComment("");
      toast.success("Comment added");
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await ticketService.deleteComment(ticketId, index);
      toast.success("Comment deleted");
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center">
        <FiMessageSquare className="text-blue-500 mr-2" />
        <h3 className="font-bold text-gray-800">Comments & Resolution</h3>
      </div>

      <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
        {!comments || comments.length === 0 ? (
          <p className="text-gray-400 text-sm italic text-center py-4">No comments yet.</p>
        ) : (
          comments.map((comment, index) => (
            <div key={index} className={`flex flex-col ${comment.userId === currentUserId ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                comment.userId === currentUserId 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                <div className="flex justify-between items-center mb-1 gap-4">
                  <span className="text-[10px] font-bold uppercase opacity-75">
                    {comment.userName || 'User'}
                  </span>
                  <span className="text-[10px] opacity-75">
                    {moment(comment.timestamp).fromNow()}
                  </span>
                </div>
                <p className="text-sm">{comment.message}</p>
                
                {comment.userId === currentUserId && (
                  <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/20">
                    <button onClick={() => handleDelete(index)} className="hover:text-red-200 transition-colors">
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
        <input 
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-white px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button 
          disabled={submitting || !newComment.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <FiSend size={16} />
          <span className="hidden sm:inline text-sm font-bold">Send</span>
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
