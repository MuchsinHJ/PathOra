/**
 * Analysis & Recommendation Types
 * Sesuai SDD §10 & SRS §3 - FR-004 CV Analysis via AI/ML
 * API Contract dari PRD §10
 */

export type AnalysisStatus = "pending" | "success" | "failed";

/**
 * Hasil analisis dari AI/ML Service
 * Struktur ini sesuai API Contract Backend ↔ AI (PRD §10)
 */
export interface AnalysisResult {
  predicted_category: string; // e.g., "INFORMATION-TECHNOLOGY"
  confidence: number; // 0-1
  top_predictions: TopPrediction[]; // Top 5 kategori
  career_recommendations: CareerRecommendation[]; // Semua kategori dengan score > 0.3
  description_career_recommendations: string; // Teks narasi rekomendasi
  matched_skills: string[]; // Skill yang dimiliki (dari CV)
  missing_skills: string[]; // Skill yang perlu ditambahkan
}

export interface TopPrediction {
  category: string;
  score: number; // match_score 0-1
  confidence: number; // confidence 0-1 
  matched_skills: string[];
  missing_skills: string[];
}

export interface CareerRecommendation {
  category: string;
  match_score: number; // 0-1
  description?: string;
  matched_skills: string[];
  missing_skills: string[];
}

export interface Analysis {
  id: string;
  cv_id: string;
  user_id: string;
  status: AnalysisStatus;
  predicted_category: string;
  confidence: number;
  result: AnalysisResult | null; // JSONB payload dari AI
  analyzed_at?: string;
  created_at: string;
}

export interface AnalysisCreateRequest {
  cv_id: string;
}

export interface AnalysisCreateResponse {
  analysis: Analysis;
}

export interface AnalysisGetResponse {
  analysis: Analysis;
}

export interface AnalysisListResponse {
  analyses: Analysis[];
  total: number;
  page: number;
  limit: number;
}

export interface AnalyzeResponse {
  id: string;
  status: AnalysisStatus;
  result?: AnalysisResult | null;
  error?: string;
  predicted_category?: string;
  confidence?: number;
}
