// Requirement #9: Fetches job list from GET /api/jobs using TanStack Query.
// Requirement #8: Displays jobs in tabs by status, matching the provided design.

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchJobs } from '../api/jobs';
import type { JobStatus } from '../types';
import JobCard from '../components/jobs/JobCard';
import Spinner from '../components/ui/Spinner';
import { PlusIcon } from '@heroicons/react/24/outline';

type TabKey = JobStatus | 'ALL';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ACTIVE', label: 'Active' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'COMPLETING', label: 'Completing' },
  { key: 'CLOSED', label: 'Closed' },
];

const PostedJobs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('ACTIVE');

  // Fetch ALL jobs once, then filter by tab on the client.
  // In production with large data sets, you'd pass { status: activeTab } to
  // the API and use separate query keys per tab (cursor pagination).
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['jobs', activeTab],
    queryFn: () => fetchJobs({ status: activeTab }),  // server-side filter (mock ignores it)
    staleTime: 30_000,      // 30s cache before background refetch
    gcTime: 5 * 60_000,    // keep cached data for 5 minutes
    retry: 2,
  });

  const allJobs = data?.data ?? [];

  const tabCounts = TABS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab.key] = allJobs.filter((j) => j.status === tab.key).length;
    return acc;
  }, {});

  const filteredJobs =
    activeTab === 'ALL' ? allJobs : allJobs.filter((j) => j.status === activeTab);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <p className="text-xs text-gray-400 mb-5">
        Business &gt;{' '}
        <span className="text-gray-500">Recruitment Suite</span> &gt;{' '}
        <span className="text-gray-700 font-medium">Jobs</span>
      </p>

      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Posted Jobs</h1>
        <button className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
          <PlusIcon className="w-4 h-4" />
          Post a Job
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {TABS.map((tab) => {
          const count = tabCounts[tab.key] ?? 0;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                isActive
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-400">Loading jobs...</p>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <p className="text-sm text-red-500 font-medium">Failed to load jobs.</p>
          <button
            onClick={() => refetch()}
            className="text-xs text-purple-600 underline hover:text-purple-800"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && filteredJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <p className="text-sm text-gray-400">No {activeTab.toLowerCase()} jobs found.</p>
          <p className="text-xs text-gray-300">Post a new job to get started.</p>
        </div>
      )}

      {/* Job Cards */}
      {!isLoading &&
        !isError &&
        filteredJobs.map((job) => <JobCard key={job.id} job={job} activeTab={activeTab} />)}
    </div>
  );
};

export default PostedJobs;
