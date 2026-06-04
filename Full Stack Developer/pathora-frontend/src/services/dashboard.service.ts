import { apiClient } from "./api.client";
import { API_ROUTES } from "../constants/api-routes";
import { ApiResponse } from "../types/api";
import {
  DashboardSummary,
  AnalysisHistoryResponse,
  AnalysisHistoryItem,
} from "../types/dashboard";

type BackendHistoryItem = Omit<Partial<AnalysisHistoryItem>, "id"> & {
  id?: string;
  analysisId?: string;
  analyzed_at?: string;
};

const normalizeHistoryItem = (item: BackendHistoryItem): AnalysisHistoryItem => ({
  id: item.id ?? item.analysisId ?? "",
  cv_id: item.cv_id ?? "",
  predicted_category: item.predicted_category ?? "Belum ada prediksi",
  confidence: item.confidence ?? 0,
  created_at: item.created_at ?? item.analyzed_at ?? "",
  status: item.status ?? "success",
});

export const dashboardService = {
  /**
   * Get dashboard summary (analisis terakhir + statistik)
   * GET /dashboard/summary
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          lastAnalysis: AnalysisHistoryItem | null;
          recentHistory: BackendHistoryItem[];
        }>
      >(API_ROUTES.DASHBOARD.ME);

      const data = response.data.data;
      if (!data) {
        throw new Error("Dashboard response tidak valid");
      }

      const recentHistory = data.recentHistory.map(normalizeHistoryItem);

      return {
        latest_analysis: data.lastAnalysis
          ? normalizeHistoryItem(data.lastAnalysis)
          : null,
        total_analyses: recentHistory.length,
      };
    } catch (error: any) {
      throw {
        code:
          error.response?.data?.error?.code ||
          error.code ||
          "GET_DASHBOARD_ERROR",
        message:
          error.response?.data?.error?.message ||
          error.message ||
          "Gagal mengambil dashboard",
      };
    }
  },

  /**
   * Get analysis history untuk dashboard
   * GET /dashboard/analysis-history
   */
  async getAnalysisHistory(
    limit: number = 5,
  ): Promise<AnalysisHistoryResponse> {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          lastAnalysis: AnalysisHistoryItem | null;
          recentHistory: BackendHistoryItem[];
        }>
      >(API_ROUTES.DASHBOARD.ME);

      const data = response.data.data;
      if (!data) {
        throw new Error("Dashboard response tidak valid");
      }

      const recentHistory = data.recentHistory.map(normalizeHistoryItem);

      return {
        items: recentHistory.slice(0, limit),
        total: recentHistory.length,
        page: 1,
        limit,
      };
    } catch (error: any) {
      throw {
        code:
          error.response?.data?.error?.code ||
          error.code ||
          "GET_HISTORY_ERROR",
        message:
          error.response?.data?.error?.message ||
          error.message ||
          "Gagal mengambil riwayat analisis",
      };
    }
  },
};
