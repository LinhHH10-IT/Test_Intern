import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Application, ApplicationStatus } from '../../types';
import { APPLICATION_COLUMNS, VALID_TRANSITIONS } from '../../types';
import ApplicationCard from './ApplicationCard';
import HireConfirmModal from './HireConfirmModal';
import toast from 'react-hot-toast';

interface ApplicationColumnsProps {
  applications: Application[];
  onStatusChange: (appId: string, newStatus: ApplicationStatus, confirmToken?: string) => void;
  updatingId: string | null;
}

const ApplicationColumns: React.FC<ApplicationColumnsProps> = ({
  applications,
  onStatusChange,
  updatingId,
}) => {
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [pendingHire, setPendingHire] = useState<{ appId: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const app = applications.find((a) => a.id === event.active.id);
    setActiveApp(app ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveApp(null);
    const { active, over } = event;
    if (!over) return;

    const appId = active.id as string;
    const targetStatus = over.id as ApplicationStatus;
    const app = applications.find((a) => a.id === appId);
    if (!app || app.status === targetStatus) return;

    // BR-008: validate transition
    const validNext = VALID_TRANSITIONS[app.status];
    if (!validNext.includes(targetStatus)) {
      toast.error(
        `Cannot move from ${app.status.replace(/_/g, ' ')} to ${targetStatus.replace(/_/g, ' ')}`,
        { duration: 2500 }
      );
      return;
    }

    // BR-009: HIRED requires confirmation modal first
    if (targetStatus === 'HIRED') {
      setPendingHire({ appId });
      return;
    }

    onStatusChange(appId, targetStatus);
  };

  const handleHireConfirm = (confirmToken: string) => {
    if (pendingHire) {
      onStatusChange(pendingHire.appId, 'HIRED', confirmToken);
      setPendingHire(null);
    }
  };

  const pendingHireApp = pendingHire
    ? applications.find((a) => a.id === pendingHire.appId)
    : null;

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
          {APPLICATION_COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.key);
            return (
              <DroppableColumn
                key={col.key}
                column={col}
                applications={colApps}
                updatingId={updatingId}
                isDragActive={!!activeApp}
              />
            );
          })}
        </div>

        {/* Ghost card that follows the cursor while dragging */}
        <DragOverlay dropAnimation={null}>
          {activeApp ? (
            <div className="w-[190px] rotate-2 shadow-2xl">
              <ApplicationCard
                application={activeApp}
                isUpdating={false}
                isDragDisabled={false}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Hire confirmation modal - shown after dropping on HIRED column */}
      {pendingHire && pendingHireApp && (
        <HireConfirmModal
          candidateName={pendingHireApp.candidateName}
          isLoading={updatingId === pendingHire.appId}
          onConfirm={handleHireConfirm}
          onCancel={() => setPendingHire(null)}
        />
      )}
    </>
  );
};

interface DroppableColumnProps {
  column: (typeof APPLICATION_COLUMNS)[number];
  applications: Application[];
  updatingId: string | null;
  isDragActive: boolean;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  column,
  applications,
  updatingId,
  isDragActive,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.key });

  return (
    <div className="flex-shrink-0 w-[190px]">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-2.5 px-1">
        <span className={`text-xs font-bold uppercase tracking-wide ${column.color}`}>
          {column.label}
        </span>
        <span className="text-xs text-gray-400 font-semibold bg-gray-100 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
          {applications.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`min-h-[100px] rounded-xl flex flex-col gap-2 p-2 transition-colors duration-150 ${
          isOver
            ? 'bg-purple-50 border-2 border-dashed border-purple-400'
            : isDragActive
              ? 'bg-gray-50 border-2 border-dashed border-gray-200'
              : 'border-2 border-transparent'
        }`}
      >
        {applications.length === 0 && !isDragActive && (
          <div className="flex items-center justify-center h-16 rounded-lg border-2 border-dashed border-gray-200">
            <span className="text-xs text-gray-300">Empty</span>
          </div>
        )}

        {applications.map((app) => {
          const isTerminal = app.status === 'HIRED' || app.status === 'FAILED';
          return (
            <ApplicationCard
              key={app.id}
              application={app}
              isUpdating={updatingId === app.id}
              isDragDisabled={isTerminal}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationColumns;
