import React from 'react';

const STATUS_STYLE = {
  OPEN:        { cls: 'bg-red-100 text-red-700',     dot: 'bg-red-500' },
  IN_PROGRESS: { cls: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  RESOLVED:    { cls: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  CLOSED:      { cls: 'bg-gray-100 text-gray-700',   dot: 'bg-gray-500' },
  REJECTED:    { cls: 'bg-red-100 text-red-700',     dot: 'bg-red-500' },
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLE[status] || STATUS_STYLE.CLOSED;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status?.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
