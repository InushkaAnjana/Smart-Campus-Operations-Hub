import React, { useState } from 'react';
import { MdBuild } from 'react-icons/md';
import ImageUpload from './ImageUpload';

const TicketForm = ({ onCancel, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'MAINTENANCE',
    priority: 'LOW',
    location: '',
    contactDetails: ''
  });
  const [images, setImages] = useState([]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, images);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-[fadeInAnim_0.15s_ease]">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-[slideUpAnim_0.2s_ease]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <MdBuild className="text-xl" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Report Maintenance Issue</h3>
          </div>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl transition-colors">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Issue Title*</label>
              <input required name="title" value={formData.title} onChange={handleChange} placeholder="Brief title of the issue" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                <option value="MAINTENANCE">Maintenance</option>
                <option value="IT_SUPPORT">IT Support</option>
                <option value="CLEANING">Cleaning</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
              <input name="location" value={formData.location} onChange={handleChange} placeholder="E.g., Library 2nd Floor" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Details</label>
              <input name="contactDetails" value={formData.contactDetails} onChange={handleChange} placeholder="Phone or Email" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
              <div className="grid grid-cols-4 gap-2">
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p, idx) => {
                  const colors = [
                    'bg-slate-50 border-slate-200 text-slate-700',
                    'bg-amber-50 border-amber-200 text-amber-700',
                    'bg-orange-50 border-orange-200 text-orange-700',
                    'bg-red-50 border-red-200 text-red-700',
                  ]
                  const selectedColors = [
                    'bg-blue-500 text-white border-blue-500 shadow-md',
                    'bg-amber-500 text-white border-amber-500 shadow-md',
                    'bg-orange-500 text-white border-orange-500 shadow-md',
                    'bg-red-500 text-white border-red-500 shadow-md',
                  ]
                  const isSelected = formData.priority === p;
                  return (
                    <label key={p} className={`flex items-center justify-center py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all hover:shadow-sm select-none ${isSelected ? selectedColors[idx] : colors[idx]}`}>
                      <input type="radio" name="priority" value={p} checked={isSelected} onChange={handleChange} className="sr-only" />
                      {p}
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description*</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe the issue in detail…" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400" />
            </div>
            
            <ImageUpload maxImages={3} onImagesChange={setImages} />
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all hover:shadow-sm">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default TicketForm;
