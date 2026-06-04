/**
 * useCVUpload Hook
 * Sesuai SDD §13 - Hooks Design
 * Menangani upload CV dengan progress tracking dan error handling
 */

import { useState } from "react";
import { cvService } from "../services/cv.service";
import { CVUploadRequest, CVUploadResponse } from "../types/cv";
import { parseApiError } from "../utils/error";

export interface CVUploadState {
  isLoading: boolean;
  error: string | null;
  progress: number; // 0-100
  cvId: string | null;
  success: boolean;
}

export function useCVUpload() {
  const [state, setState] = useState<CVUploadState>({
    isLoading: false,
    error: null,
    progress: 0,
    cvId: null,
    success: false,
  });

  const uploadCV = async (payload: CVUploadRequest): Promise<CVUploadResponse | null> => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: 0,
      success: false,
    }));

    try {
      // Simulasi progress untuk UX feedback
      const progressInterval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      const result = await cvService.uploadCV(payload);

      clearInterval(progressInterval);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        progress: 100,
        cvId: result.id,
        success: true,
      }));

      return result;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: parseApiError(error),
        progress: 0,
        success: false,
      }));
      return null;
    }
  };

  const resetState = () => {
    setState({
      isLoading: false,
      error: null,
      progress: 0,
      cvId: null,
      success: false,
    });
  };

  return {
    ...state,
    uploadCV,
    resetState,
  };
}
