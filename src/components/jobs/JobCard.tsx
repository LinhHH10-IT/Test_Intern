import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Job, ApplicationStatus } from '../../types';
import { updateApplicationStatus, closeJob } from '../../api/jobs';
import { VALID_TRANSITIONS } from '../../types';
import Badge from '../ui/Badge';
import ApplicationColumns from './ApplicationColumns';
import {
  MapPinIcon,
  BriefcaseIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EllipsisVerticalIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface JobCardProps {
  job: Job;
  activeTab: string;
}

const JobCard: React.FC<JobCardProps> = ({ job, activeTab }) => {
  const [expanded, setExpanded] = useState(job.status === 'ACTIVE');
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const totalApps = job.applications.length;
  const newApps = job.applications.filter((a) => a.isNew).length;

  // ─── Update Application Status Mutation ──────────────────────────────────
  const statusMutation = useMutation({
    mutationFn: ({
      appId,
      newStatus,
      confirmToken,
    }: {
      appId: string;
      newStatus: ApplicationStatus;
      confirmToken?: string;
    }) => updateApplicationStatus(appId, { status: newStatus, confirmToken }),

    onMutate: async ({ appId, newStatus }) => {
      setUpdatingAppId(appId);

      // Optimistic update (Req #13 - FE performance)
      await queryClient.cancelQueries({ queryKey: ['jobs', activeTab] });
      const previousData = queryClient.getQueryData(['jobs', activeTab]);

      queryClient.setQueryData(['jobs', activeTab], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((j: Job) => ({
            ...j,
            applications: j.applications.map((a) =>
              a.id === appId ? { ...a, status: newStatus, isNew: false } : a
            ),
          })),
        };
      });

      return { previousData };
    },

    onSuccess: (_, { newStatus }) => {
      const label = newStatus.replace(/_/g, ' ');
      toast.success(`Status updated to ${label}`, { duration: 3000 });

    },

    onError: (error: any, _, context) => {
      // Rollback optimistic update
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(['jobs', activeTab], context.previousData);
      }
      toast.error(error?.message ?? 'Failed to update status. Please try again.');
    },

    onSettled: () => {
      setUpdatingAppId(null);
      // Chỉ refetch khi có real backend, không refetch với mock data
      if (import.meta.env.VITE_API_BASE_URL) {
        queryClient.invalidateQueries({ queryKey: ['jobs', activeTab] });
      }
    },
  });

  // ─── Close Job Mutation ───────────────────────────────────────────────────
  const closeMutation = useMutation({
    mutationFn: (_?: undefined) => closeJob(job.id),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['jobs', activeTab] });
      const previousData = queryClient.getQueryData(['jobs', activeTab]);

      // Optimistic: đổi status job sang CLOSED ngay
      queryClient.setQueryData(['jobs', activeTab], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((j: Job) =>
            j.id === job.id ? { ...j, status: 'CLOSED' } : j
          ),
        };
      });

      return { previousData };
    },

    onSuccess: () => {
      toast.success('Job closed successfully.');
    },

    onError: (_err: any, _vars: any, context: any) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(['jobs', activeTab], context.previousData);
      }
      toast.error('Failed to close job.');
    },

    onSettled: () => {
      if (import.meta.env.VITE_API_BASE_URL) {
        queryClient.invalidateQueries({ queryKey: ['jobs', activeTab] });
      }
    },
  });

  // ─── Validate status transition before calling mutation ───────────────────
  const handleStatusChange = useCallback(
    (appId: string, newStatus: ApplicationStatus, confirmToken?: string) => {
      const app = job.applications.find((a) => a.id === appId);
      if (!app) return;

      // BR-008: Validate transition client-side first
      const validNext = VALID_TRANSITIONS[app.status];
      if (!validNext.includes(newStatus)) {
        toast.error(`Cannot move from ${app.status} to ${newStatus}`);
        return;
      }

      statusMutation.mutate({ appId, newStatus, confirmToken });
    },
    [job.applications, statusMutation]
  );

  const locationIcon =
    job.workMode === 'Remote' ? (
      <ComputerDesktopIcon className="w-3.5 h-3.5" />
    ) : (
      <MapPinIcon className="w-3.5 h-3.5" />
    );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4 overflow-hidden hover:shadow-md transition-shadow">
      {/* ── Job Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Toggle expand */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-gray-400 hover:text-purple-600 transition-colors flex-shrink-0"
          >
            {expanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm truncate">{job.title}</span>
              <Badge variant={job.status} />
              {newApps > 0 && (
                <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">
                  {newApps} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                {locationIcon}
                {job.workMode === 'Remote' ? 'Remote' : job.city || job.location}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <BriefcaseIcon className="w-3.5 h-3.5" />
                {job.jobType}
              </span>
              <span className="text-xs text-gray-400 font-mono">#{job.jobCode}</span>
              {totalApps > 0 && (
                <span className="text-xs text-gray-400">
                  {totalApps} applicant{totalApps !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {job.status === 'ACTIVE' && (
            <button
              onClick={() => closeMutation.mutate(undefined)}
              disabled={closeMutation.isPending}
              className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 rounded-full px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50 font-medium"
            >
              <XCircleIcon className="w-3.5 h-3.5" />
              Close Job
            </button>
          )}
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Application Pipeline ────────────────────────────────────────── */}
      {expanded && (
        <div className="px-5 pb-4 border-t border-gray-100 pt-4 bg-gray-50/50">
          {job.applications.length === 0 && job.status === 'PENDING' ? (
            <p className="text-xs text-gray-400 text-center py-4">
              Job is pending approval. No applications yet.
            </p>
          ) : (
            <ApplicationColumns
              applications={job.applications}
              onStatusChange={handleStatusChange}
              updatingId={updatingAppId}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default JobCard;
