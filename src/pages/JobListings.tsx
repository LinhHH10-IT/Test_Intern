// Candidate-facing job listing page.
// FE-BR-001: Disable Apply button if job.status !== 'ACTIVE'
// FE-BR-002: Show current application status if already applied
// FE-BR-003: Require login before opening the apply modal
// FE-BR-005: Toast + cache update on successful application

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  MapPinIcon,
  BriefcaseIcon,
  ComputerDesktopIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { fetchJobs } from '../api/jobs';
import { applyToJob, getMyApplications } from '../api/applications';
import type { Job, CandidateApplyPayload, JobType, WorkMode } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ApplyModal from '../components/jobs/ApplyModal';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

// Maps ApplicationStatus to a readable pill colour
const STATUS_PILL: Record<string, string> = {
  NEW_APPLICATION: 'bg-blue-100 text-blue-700',
  SCREENING:       'bg-purple-100 text-purple-700',
  INTERVIEW:       'bg-indigo-100 text-indigo-700',
  OFFER:           'bg-teal-100 text-teal-700',
  HIRED:           'bg-green-100 text-green-700',
  FAILED:          'bg-red-100 text-red-600',
};
const STATUS_LABEL: Record<string, string> = {
  NEW_APPLICATION: 'Applied',
  SCREENING:       'In Screening',
  INTERVIEW:       'Interview',
  OFFER:           'Offer Received',
  HIRED:           'Hired 🎉',
  FAILED:          'Not Selected',
};

const WORK_MODE_FILTERS: WorkMode[] = ['Remote', 'Hybrid', 'Onsite'];
const TYPE_FILTERS: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Internship'];

const JobListings: React.FC = () => {
  const { user, login } = useAuth();
  const queryClient = useQueryClient();

  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<WorkMode | ''>('');
  const [filterType, setFilterType] = useState<JobType | ''>('');

  // ── Fetch all jobs (all statuses, candidate sees everything) ─────────────
  const { data: jobsData, isLoading: jobsLoading, isError } = useQuery({
    queryKey: ['jobs-public'],
    queryFn: () => fetchJobs(),
    staleTime: 30_000,
    retry: 2,
  });

  // ── Fetch candidate's own applications (to power FE-BR-002) ─────────────
  const { data: myApps } = useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: () => getMyApplications(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  });

  // Build a lookup map: jobId → MyApplication
  const myAppsMap = useMemo(
    () => Object.fromEntries((myApps ?? []).map((a) => [a.jobId, a])),
    [myApps]
  );

  // ── Apply mutation ────────────────────────────────────────────────────────
  const applyMutation = useMutation({
    mutationFn: (payload: CandidateApplyPayload) =>
      applyToJob(applyingJob!.id, user!.id, payload),

    onSuccess: (newApp) => {
      // FE-BR-005: toast + update my-applications cache
      toast.success(`Application submitted for ${applyingJob?.title}!`);
      queryClient.setQueryData(
        ['my-applications', user?.id],
        (old: typeof myApps) => [...(old ?? []), newApp]
      );
      setApplyingJob(null);
    },

    onError: (err: any) => {
      toast.error(err?.message ?? 'Failed to submit application. Please try again.');
    },
  });

  // ── Client-side filtering ─────────────────────────────────────────────────
  const allJobs = jobsData?.data ?? [];
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      if (search && !job.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterMode && job.workMode !== filterMode) return false;
      if (filterType && job.jobType !== filterType) return false;
      return true;
    });
  }, [allJobs, search, filterMode, filterType]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleApplyClick = (job: Job) => {
    if (!user) {
      // FE-BR-003: prompt login
      toast('Please sign in to apply for this job.', { icon: '🔒' });
      login();
      return;
    }
    setApplyingJob(job);
  };

  const handleSubmitApplication = (payload: CandidateApplyPayload) => {
    applyMutation.mutate(payload);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <p className="text-xs text-gray-400 mb-5">
        Home &gt;{' '}
        <span className="text-gray-700 font-medium">Job Listings</span>
      </p>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Find Your Next Job</h1>
        <p className="text-sm text-gray-500 mt-1">
          {allJobs.filter((j) => j.status === 'ACTIVE').length} active positions available
        </p>
      </div>

      {/* Search & filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          />
        </div>

        {/* Work mode filter */}
        <div className="flex items-center gap-1.5">
          <FunnelIcon className="w-3.5 h-3.5 text-gray-400" />
          {WORK_MODE_FILTERS.map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(filterMode === m ? '' : m)}
              className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-colors ${
                filterMode === m
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Job type filter */}
        <div className="flex items-center gap-1.5">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(filterType === t ? '' : t)}
              className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-colors ${
                filterType === t
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {jobsLoading && (
        <div className="flex items-center justify-center h-48 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-400">Loading jobs…</p>
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-500 text-center py-12">Failed to load jobs.</p>
      )}

      {!jobsLoading && !isError && filteredJobs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400">No jobs match your search.</p>
        </div>
      )}

      {/* Job cards */}
      {!jobsLoading && !isError && (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const isActive = job.status === 'ACTIVE';
            const myApp = myAppsMap[job.id];

            return (
              <div
                key={job.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start justify-between gap-4 transition-shadow hover:shadow-md ${
                  isActive ? 'border-gray-200' : 'border-gray-100 opacity-70'
                }`}
              >
                {/* Job info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{job.title}</span>
                    <Badge variant={job.status} />
                    <span className="text-xs font-mono text-gray-400">#{job.jobCode}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      {job.workMode === 'Remote' ? (
                        <ComputerDesktopIcon className="w-3.5 h-3.5" />
                      ) : (
                        <MapPinIcon className="w-3.5 h-3.5" />
                      )}
                      {job.workMode === 'Remote' ? 'Remote' : job.city ?? job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <BriefcaseIcon className="w-3.5 h-3.5" />
                      {job.jobType}
                    </span>
                    <span>{job.workMode}</span>
                    {job.slots && (
                      <span className="text-gray-400">{job.slots} slot{job.slots !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>

                {/* CTA — FE-BR-001, FE-BR-002, FE-BR-003 */}
                <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                  {myApp ? (
                    /* FE-BR-002: Already applied — show current status */
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                        STATUS_PILL[myApp.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATUS_LABEL[myApp.status] ?? myApp.status}
                    </span>
                  ) : !isActive ? (
                    /* FE-BR-001: Not ACTIVE — disable */
                    <button
                      disabled
                      className="text-xs font-medium px-4 py-2 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                    >
                      Not Accepting Applications
                    </button>
                  ) : !user ? (
                    /* FE-BR-003: Not logged in */
                    <button
                      onClick={() => handleApplyClick(job)}
                      className="text-xs font-semibold px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                    >
                      🔒 Sign In to Apply
                    </button>
                  ) : (
                    /* FE-BR-001: ACTIVE + logged in → apply */
                    <button
                      onClick={() => handleApplyClick(job)}
                      className="text-xs font-semibold px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      {applyingJob && (
        <ApplyModal
          job={applyingJob}
          isLoading={applyMutation.isPending}
          onSubmit={handleSubmitApplication}
          onCancel={() => !applyMutation.isPending && setApplyingJob(null)}
        />
      )}
    </div>
  );
};

export default JobListings;
