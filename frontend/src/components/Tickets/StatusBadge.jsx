import React from 'react';

/**
 * StatusBadge - Reusable UI component for status/priority display
 */
const StatusBadge = ({ type, value }) => {
  const getColors = () => {
    if (type === 'status') {
      switch (value) {
        case 'OPEN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
        case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
        case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    
    if (type === 'priority') {
      switch (value) {
        case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
        case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getColors()}`}>
      {value.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
