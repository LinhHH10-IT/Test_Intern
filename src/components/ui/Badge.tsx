import React from 'react';
import type { JobStatus, ApplicationStatus } from '../../types';

type BadgeVariant = JobStatus | ApplicationStatus | 'NEW' | 'MATCH';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

const variantStyles: Record<string, string> = {
  // Job statuses
  ACTIVE: 'bg-green-100 text-green-700 border border-green-200',
  PENDING: 'bg-orange-100 text-orange-600 border border-orange-200',
  COMPLETING: 'bg-blue-100 text-blue-600 border border-blue-200',
  CLOSED: 'bg-gray-100 text-gray-500 border border-gray-200',
  // Application statuses
  NEW: 'bg-yellow-300 text-yellow-900 font-bold',
  NEW_APPLICATION: 'bg-blue-50 text-blue-600 border border-blue-100',
  SCREENING: 'bg-purple-50 text-purple-600 border border-purple-100',
  INTERVIEW: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
  OFFER: 'bg-teal-50 text-teal-600 border border-teal-100',
  HIRED: 'bg-green-50 text-green-600 border border-green-100',
  FAILED: 'bg-red-50 text-red-500 border border-red-100',
  MATCH: 'bg-gray-100 text-gray-600',
};

const Badge: React.FC<BadgeProps> = ({ variant, label, className = '' }) => {
  const style = variantStyles[variant] ?? 'bg-gray-100 text-gray-500';
  const displayLabel = label ?? variant.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded ${style} ${className}`}
    >
      {displayLabel}
    </span>
  );
};

export default Badge;
