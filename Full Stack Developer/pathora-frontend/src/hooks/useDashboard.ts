/**
 * useDashboard Hook
 * Sesuai SDD §13 - Hooks Design
 * Menangani fetch dashboard summary dan analysis history
 */

import { useState, useEffect } from "react";
import { dashboardService } from "../services/dashboard.service";
import { DashboardSummary, AnalysisHistoryItem } from "../types/dashboard";
import { parseApiError } from "../utils/error";

export interface DashboardState {
  summary: DashboardSummary | null;
  history: AnalysisHistoryItem[];
  isLoading: boolean;
  error: string | null;
}

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    summary: null,
    history: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const [summary, historyResponse] = await Promise.all([
          dashboardService.getDashboardSummary(),
          dashboardService.getAnalysisHistory(5),
        ]);

        setState((prev) => ({
          ...prev,
          summary,
          history: historyResponse.items,
          isLoading: false,
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: parseApiError(error),
          isLoading: false,
        }));
      }
    };

    fetchDashboard();
  }, []);

  const refresh = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [summary, historyResponse] = await Promise.all([
        dashboardService.getDashboardSummary(),
        dashboardService.getAnalysisHistory(5),
      ]);

      setState((prev) => ({
        ...prev,
        summary,
        history: historyResponse.items,
        isLoading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: parseApiError(error),
        isLoading: false,
      }));
    }
  };

  return {
    ...state,
    refresh,
  };
}
