import React, { useState } from 'react';
import { format } from 'date-fns';
import { ticketService } from '../../services/ticketService';
import { toast } from 'react-toastify';

const CommentSection = ({ ticketId, comments, userId, onCommentAdded }) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      await ticketService.addComment(ticketId, userId, newComment);
      setNewComment('');
      toast.success('Comment added successfully');
      onCommentAdded();
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await ticketService.deleteComment(ticketId, commentId, userId);
      toast.success('Comment deleted');
      onCommentAdded();
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden animate-[fadeInAnim_0.5s_ease]">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Comments ({comments?.length || 0})</h3>
      
      <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {comments?.map((comment) => (
          <div key={comment.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100/50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-slate-800">{comment.userName || 'User'}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                  {format(new Date(comment.timestamp), 'MMM dd, yyyy h:mm a')}
                </span>
                {comment.userId === userId && (
                  <button onClick={() => handleDelete(comment.id)} className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-50 hover:bg-red-100 rounded-md transition-colors">Delete</button>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{comment.message}</p>
          </div>
        ))}
        {(!comments || comments.length === 0) && (
          <div className="text-center text-slate-400 py-8 text-sm font-semibold bg-slate-50 rounded-xl border border-dashed border-slate-200">No comments yet. Start the conversation!</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Type your comment here..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-medium placeholder-slate-400 shadow-inner"
          rows={3}
        />
        <div className="text-right mt-3">
          <button 
            type="submit" 
            disabled={loading || !newComment.trim()} 
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/25 hover:bg-indigo-700 disabled:opacity-50 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
