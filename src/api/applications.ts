// Candidate Apply API
// FE-BR-003: caller must ensure user is authenticated before calling applyToJob
// FE-BR-004: file validation is done at the component level before creating the payload

import type { CandidateApplyPayload, MyApplication } from '../types';
import apiClient from './client';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

// In-memory store: key = `${userId}_${jobId}`
// Re-exported so components can read it synchronously (mock only)
export const mockAppliedStore: Record<string, MyApplication> = {};

// ─── POST /jobs/:id/apply ──────────────────────────────────────────────────────
// FE-BR-005: on success, caller shows toast + updates query cache

export const applyToJob = async (
  jobId: string,
  userId: string,
  payload: CandidateApplyPayload
): Promise<MyApplication> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));

    const key = `${userId}_${jobId}`;
    if (mockAppliedStore[key]) {
      throw new Error('You have already applied to this job.');
    }

    const application: MyApplication = {
      id: `my-app-${Date.now()}`,
      jobId,
      status: 'NEW_APPLICATION',
      appliedAt: new Date().toISOString(),
      cvFileName: payload.cvFile.name,
    };
    mockAppliedStore[key] = application;
    return application;
  }

  const formData = new FormData();
  formData.append('cv', payload.cvFile);
  if (payload.coverLetter) formData.append('coverLetter', payload.coverLetter);

  const { data } = await apiClient.post<MyApplication>(
    `/api/jobs/${jobId}/apply`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};

// ─── GET /my-applications ──────────────────────────────────────────────────────
// Returns all applications submitted by the current authenticated user

export const getMyApplications = async (userId: string): Promise<MyApplication[]> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return Object.entries(mockAppliedStore)
      .filter(([key]) => key.startsWith(`${userId}_`))
      .map(([, app]) => app);
  }

  const { data } = await apiClient.get<{ data: MyApplication[] }>('/api/my-applications');
  return data.data;
};
