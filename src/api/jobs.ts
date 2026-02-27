import type { JobsResponse, ApplicationStatus, UpdateStatusPayload } from '../types';
import { MOCK_JOBS } from '../data/mockData';
import apiClient from './client';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

// ─── GET /jobs ─────────────────────────────────────────────────────────────────
// Requirement #9: Call GET /jobs to fetch and display data on UI.
// Falls back to mock data when VITE_API_BASE_URL is not configured.

export const fetchJobs = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
  cursor?: string;
}): Promise<JobsResponse> => {
  if (USE_MOCK) {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 500));

    const filtered = params?.status
      ? MOCK_JOBS.filter((j) => j.status === params.status)
      : MOCK_JOBS;

    return {
      data: filtered,
      total: filtered.length,
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
  }

  const { data } = await apiClient.get<JobsResponse>('/api/jobs', { params });
  return data;
};

// ─── PATCH /applications/:id/status ──────────────────────────────────────────
// Updates the status of an application (recruiter only).
// BR-008: Only valid transitions are allowed.
// BR-009: HIRED requires confirmToken.

export const updateApplicationStatus = async (
  applicationId: string,
  payload: UpdateStatusPayload
): Promise<void> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));

    // Simulate validation: HIRED requires confirmToken
    if (payload.status === 'HIRED' && !payload.confirmToken) {
      throw new Error('Confirmation required for HIRED status');
    }
    return;
  }

  await apiClient.patch(`/api/applications/${applicationId}/status`, payload);
};

// ─── PATCH /jobs/:id/status ───────────────────────────────────────────────────
// Close a job (recruiter only).

export const closeJob = async (jobId: string): Promise<void> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return;
  }
  await apiClient.patch(`/api/jobs/${jobId}/status`, { status: 'CLOSED' });
};

// Helper to get all valid next statuses for a given current status
export const getValidNextStatuses = (currentStatus: ApplicationStatus): ApplicationStatus[] => {
  const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    NEW_APPLICATION: ['SCREENING', 'FAILED'],
    SCREENING: ['INTERVIEW', 'FAILED'],
    INTERVIEW: ['OFFER', 'FAILED'],
    OFFER: ['HIRED', 'FAILED'],
    HIRED: [],
    FAILED: [],
  };
  return transitions[currentStatus] ?? [];
};
