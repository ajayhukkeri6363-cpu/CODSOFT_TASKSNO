import React from 'react';
import { getStatusBadgeVariant } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const { bg, text, border, label } = getStatusBadgeVariant(status);

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-xs px-3 py-1 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${bg} ${text} ${border} ${sizes[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {label}
    </span>
  );
};
