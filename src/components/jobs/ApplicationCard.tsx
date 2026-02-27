import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Application } from '../../types';
import Badge from '../ui/Badge';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

interface ApplicationCardProps {
  application: Application;
  isUpdating: boolean;
  isDragDisabled?: boolean; // terminal states (HIRED/FAILED)
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  isUpdating,
  isDragDisabled = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
    disabled: isDragDisabled || isUpdating,
    data: { application },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragDisabled ? 'default' : isDragging ? 'grabbing' : 'grab',
    transition: isDragging ? undefined : 'box-shadow 0.15s, opacity 0.15s',
  };

  const scoreColor =
    application.aiMatchScore >= 90
      ? 'text-green-600'
      : application.aiMatchScore >= 75
        ? 'text-yellow-600'
        : 'text-gray-500';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-xl p-3 border select-none ${
        isDragging
          ? 'shadow-2xl border-purple-300 z-50'
          : 'shadow-sm border-gray-100 hover:shadow-md hover:border-purple-200'
      } transition-shadow`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-1.5">
        <div>{application.isNew && <Badge variant="NEW" label="NEW" />}</div>
        <button
          className="text-gray-300 hover:text-gray-500 transition-colors"
          onPointerDown={(e) => e.stopPropagation()} // prevent drag from the menu button
        >
          <EllipsisVerticalIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Candidate info */}
      <p className="text-sm font-semibold text-gray-900 leading-snug">
        {application.candidateName}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">
        {application.candidateTitle}
        <span className={`font-semibold ml-1 ${scoreColor}`}>
          - {application.aiMatchScore}% Match
        </span>
      </p>

      {/* Loading indicator while updating */}
      {isUpdating && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-xs text-gray-400">Updating</span>
        </div>
      )}

      {/* Terminal state badge */}
      {isDragDisabled && !isUpdating && (
        <div className="mt-2">
          <Badge
            variant={application.status}
            label={application.status === 'HIRED' ? '✓ Hired' : '✗ Failed'}
          />    
        </div>
      )}
    </div>
  );
};

export default ApplicationCard;
