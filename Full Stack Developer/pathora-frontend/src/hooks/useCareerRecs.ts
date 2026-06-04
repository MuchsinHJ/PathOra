/**
 * useCareerRecs Hook
 * Sesuai SDD §13 - Hooks Design
 * Menangani fetch career recommendations dari analysis
 */

import { useState, useEffect } from "react";
import { analysisService } from "../services/analysis.service";
import { Analysis } from "../types/analysis";
import { parseApiError } from "../utils/error";

export interface CareerRecsState {
  analysis: Analysis | null;
  isLoading: boolean;
  error: string | null;
}

export function useCareerRecs(analysisId?: string) {
  const [state, setState] = useState<CareerRecsState>({
    analysis: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!analysisId) return;

    const fetchAnalysis = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await analysisService.getAnalysis(analysisId);
        setState((prev) => ({
          ...prev,
          analysis: result,
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

    fetchAnalysis();
  }, [analysisId]);

  return {
    ...state,
  };
}
