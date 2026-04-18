import React, { useState, useEffect } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';

/**
 * ImageUpload - Component for selecting and previewing up to 3 images
 */
const ImageUpload = ({ onImagesChange }) => {
  const [previews, setPreviews] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate max 3 images total
    if (selectedFiles.length + files.length > 3) {
      alert("Maximum 3 images allowed");
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    onImagesChange(newFiles);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onImagesChange(newFiles);
    
    // Clean up revoked URLs
    URL.revokeObjectURL(previews[index]);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${selectedFiles.length >= 3 ? 'opacity-50 cursor-not-allowed' : 'border-gray-300'}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 font-medium">Click to upload images</p>
            <p className="text-xs text-gray-400">PNG, JPG or WEBP (Max 3 files)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            multiple 
            accept="image/*"
            disabled={selectedFiles.length >= 3}
          />
        </label>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {previews.map((src, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
              <img src={src} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
