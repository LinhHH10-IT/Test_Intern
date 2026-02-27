// ─── Enums ────────────────────────────────────────────────────────────────────

export type JobStatus = 'ACTIVE' | 'PENDING' | 'COMPLETING' | 'CLOSED';

export type ApplicationStatus =
  | 'NEW_APPLICATION'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'HIRED'
  | 'FAILED';

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export type WorkMode = 'Remote' | 'Onsite' | 'Hybrid';

// ─── Models ───────────────────────────────────────────────────────────────────

export interface Application {
  id: string;
  candidateName: string;
  candidateTitle: string;
  aiMatchScore: number;
  status: ApplicationStatus;
  appliedAt: string;
  cvUrl: string;
  coverLetter?: string;
  isNew?: boolean;
}

export interface Job {
  id: string;
  title: string;
  jobCode: string;
  location: string;
  city?: string;
  jobType: JobType;
  workMode: WorkMode;
  status: JobStatus;
  applications: Application[];
  slots?: number;
  createdAt?: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface JobsResponse {
  data: Job[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateStatusPayload {
  status: ApplicationStatus;
  note?: string;
  confirmToken?: string; // Required when status = HIRED
}

// ─── Status Transition Rules (BR-008) ─────────────────────────────────────────

export const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  NEW_APPLICATION: ['SCREENING', 'FAILED'],
  SCREENING: ['INTERVIEW', 'FAILED'],
  INTERVIEW: ['OFFER', 'FAILED'],
  OFFER: ['HIRED', 'FAILED'],
  HIRED: [],
  FAILED: [],
};

export const APPLICATION_COLUMNS: { key: ApplicationStatus; label: string; color: string }[] = [
  { key: 'NEW_APPLICATION', label: 'New Application', color: 'text-blue-600' },
  { key: 'SCREENING', label: 'Screening', color: 'text-purple-600' },
  { key: 'INTERVIEW', label: 'Interview', color: 'text-indigo-600' },
  { key: 'OFFER', label: 'Offer', color: 'text-teal-600' },
  { key: 'HIRED', label: 'Hired', color: 'text-green-600' },
  { key: 'FAILED', label: 'Failed', color: 'text-red-500' },
];

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'recruiter';
}

// ─── Candidate Apply ──────────────────────────────────────────────────────────

// FE-BR-004: only PDF/DOC, max 5MB (validated before creating this payload)
export interface CandidateApplyPayload {
  cvFile: File;
  coverLetter?: string;
}

export interface MyApplication {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  appliedAt: string;
  cvFileName: string;
}

export const ACCEPTED_CV_TYPES = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const;
export const MAX_CV_SIZE_MB = 5;
export const MAX_CV_SIZE_BYTES = MAX_CV_SIZE_MB * 1024 * 1024;
