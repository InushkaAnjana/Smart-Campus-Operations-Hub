import React, { useState } from 'react';
import { MdImage, MdClose } from 'react-icons/md';

const ImageUpload = ({ maxImages = 3, onImagesChange }) => {
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images.`);
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);
    onImagesChange(newImages);

    const newUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newUrls]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewUrls(newUrls);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">Images (Max {maxImages})</label>
      <div className="flex flex-wrap gap-4">
        {previewUrls.map((url, idx) => (
          <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
            <img src={url} alt={`preview ${idx}`} className="w-full h-full object-cover" />
            <button 
              type="button" 
              onClick={() => removeImage(idx)} 
              className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-600 hover:bg-white hover:text-red-800 transition-colors"
            >
              <MdClose size={14} />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
            <MdImage className="text-2xl text-indigo-400 mb-1" />
            <span className="text-xs text-slate-500 font-medium">Add Image</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
