/**
 * Dashboard Types
 * Sesuai SDD §10 & SRS §3 - FR-002 Dashboard Utama
 */

export interface DashboardSummary {
  latest_analysis: AnalysisHistoryItem | null; // Analisis terbaru atau null jika belum pernah
  total_analyses: number;
  categories_distribution?: Record<string, number>; // Untuk admin dashboard (P2)
}

export interface DashboardSummaryResponse {
  summary: DashboardSummary;
}

export interface AnalysisHistoryItem {
  id: string;
  cv_id: string;
  predicted_category: string;
  confidence: number;
  created_at: string;
  status: "success" | "failed" | "pending";
}

export interface AnalysisHistoryResponse {
  items: AnalysisHistoryItem[];
  total: number;
  page: number;
  limit: number;
}
