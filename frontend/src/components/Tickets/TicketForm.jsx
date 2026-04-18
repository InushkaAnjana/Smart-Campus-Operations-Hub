import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ImageUpload from './ImageUpload';
import { ticketService } from '../../services/ticketService';
import { toast } from 'react-toastify';

/**
 * TicketForm - UI for creating a maintenance ticket
 */
const TicketForm = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Blob for JSON parts
      const ticketBlob = new Blob([JSON.stringify({
        ...data,
      })], { type: 'application/json' });
      
      formData.append('ticket', ticketBlob);
      
      // Add images
      images.forEach(image => {
        formData.append('images', image);
      });

      await ticketService.createTicket(formData);
      toast.success("Ticket created successfully!");
      reset();
      setImages([]);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            {...register("category", { required: "Category is required" })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          >
            <option value="">Select Category</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="IT_SUPPORT">IT Support</option>
            <option value="FURNITURE">Furniture</option>
            <option value="CLEANING">Cleaning</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            {...register("priority", { required: "Priority is required" })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      {/* Resource ID / Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resource ID (Asset Code)</label>
          <input
            {...register("resourceId")}
            placeholder="e.g. AC-101"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specific Location</label>
          <input
            {...register("location", { required: "Location is required" })}
            placeholder="e.g. Building A, Floor 2, Room 204"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
        <textarea
          {...register("description", { required: "Please describe the issue" })}
          rows="4"
          placeholder="Detailed description of the problem..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        ></textarea>
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
      </div>

      {/* Contact Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Details</label>
        <input
          {...register("contactDetails", { required: "Contact details are required" })}
          placeholder="Phone number or extension"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        {errors.contactDetails && <p className="text-red-500 text-xs mt-1">{errors.contactDetails.message}</p>}
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Optional)</label>
        <ImageUpload onImagesChange={setImages} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transform hover:-translate-y-0.5 active:translate-y-0 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Submitting...' : 'Report Incident'}
      </button>
    </form>
  );
};

export default TicketForm;
