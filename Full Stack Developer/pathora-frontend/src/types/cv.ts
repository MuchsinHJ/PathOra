/**
 * CV Types
 * Sesuai SDD §10 & SRS §3 - FR-003 Upload & Manage CV
 */

export type CVSourceType = "text" | "file";

export interface CV {
  id: string;
  user_id: string;
  source_type: CVSourceType;
  raw_text: string;
  file_url?: string | null;
  created_at: string;
}

export interface CVUploadRequest {
  source_type: CVSourceType;
  raw_text?: string;
  file?: File; // Client-side untuk form data
}

export interface CVUploadResponse {
  id: string;
  user_id: string;
  source_type: CVSourceType;
  raw_text: string;
  file_url?: string | null;
  created_at: string;
}

export interface CVListResponse {
  cvs: CV[];
  total: number;
  page: number;
  limit: number;
}

export interface CVGetResponse {
  cv: CV;
}
