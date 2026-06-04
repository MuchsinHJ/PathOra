/**
 * useAnalysis Hook
 * Sesuai SDD §13 - Hooks Design
 * Menangani fetch analysis results
 */

import { useState, useEffect } from "react";
import { analysisService } from "../services/analysis.service";
import { cvService } from "../services/cv.service";
import { Analysis, AnalyzeResponse } from "../types/analysis";
import { parseApiError } from "../utils/error";

export interface AnalysisState {
  analysis: Analysis | null;
  isLoading: boolean;
  error: string | null;
  isAnalyzing: boolean;
}

export function useAnalysis(analysisId?: string) {
  const [state, setState] = useState<AnalysisState>({
    analysis: null,
    isLoading: false,
    error: null,
    isAnalyzing: false,
  });

  // Fetch analysis result
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

  // Analyze CV
  const analyzeCV = async (cvId: string): Promise<AnalyzeResponse | null> => {
    setState((prev) => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const result = await cvService.analyzeCV(cvId);
      setState((prev) => ({
        ...prev,
        isAnalyzing: false,
      }));
      return result;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: parseApiError(error),
        isAnalyzing: false,
      }));
      return null;
    }
  };


  return {
    ...state,
    analyzeCV,
   
  };
}
