import { apiClient } from "./api.client";
import { API_ROUTES } from "../constants/api-routes";
import { ENV } from "../constants/environment";
import { ApiResponse } from "../types/api";
import {
  CV,
  CVUploadRequest,
  CVUploadResponse,
  CVListResponse,
} from "../types/cv";
import { AnalyzeResponse } from "../types/analysis";
import { normalizeAnalyzeResponse } from "./analysis.service";

export const cvService = {
  /**
   * Upload CV (teks atau file)
   * POST /cvs
   * Menggunakan FormData jika upload file
   */
  async uploadCV(payload: CVUploadRequest): Promise<CVUploadResponse> {
    try {
      let data: any;

      if (payload.source_type === "file" && payload.file) {
        // Upload file menggunakan FormData
        const formData = new FormData();
        formData.append("source_type", payload.source_type);
        formData.append("file", payload.file);

        const response = await apiClient.post<ApiResponse<CVUploadResponse>>(
          API_ROUTES.CVS.UPLOAD,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        return response.data.data as CVUploadResponse;
      } else {
        // Upload teks CV
        data = {
          source_type: "text",
          raw_text: payload.raw_text,
        };

        const response = await apiClient.post<ApiResponse<CVUploadResponse>>(
          API_ROUTES.CVS.UPLOAD,
          data,
        );
        return response.data.data as CVUploadResponse;
      }
    } catch (error: any) {
      throw {
        code:
          error.response?.data?.error?.code || error.code || "CV_UPLOAD_ERROR",
        message:
          error.response?.data?.error?.message ||
          error.message ||
          "Gagal mengunggah CV",
        status: error.response?.status || error.status,
        details: error.response?.data?.error?.details || error.details,
      };
    }
  },

  /**
   * Get satu CV berdasarkan ID
   * GET /cvs/:id
   */
  async getCV(cvId: string): Promise<CV> {
    try {
      const response = await apiClient.get<ApiResponse<CV>>(
        API_ROUTES.CVS.GET_CV(cvId),
      );
      if (!response.data.data) {
        throw new Error("CV response tidak valid");
      }
      return response.data.data;
    } catch (error: any) {
      throw {
        code: error.response?.data?.error?.code || error.code || "GET_CV_ERROR",
        message:
          error.response?.data?.error?.message ||
          error.message ||
          "Gagal mengambil CV",
        status: error.response?.status || error.status,
        details: error.response?.data?.error?.details || error.details,
      };
    }
  },

  /**
   * Trigger analisis untuk CV
   * POST /cvs/:id/analyze
   * Ini mengirim CV ke AI service dan menyimpan hasil
   */
  async analyzeCV(cvId: string): Promise<AnalyzeResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AnalyzeResponse>>(
        API_ROUTES.CVS.ANALYZE(cvId),
        undefined,
        {
          timeout: ENV.AI_TIMEOUT_MS + 5000,
        },
      );
      if (!response.data.data) {
        throw new Error("Analyze response tidak valid");
      }
      return normalizeAnalyzeResponse(response.data.data);
    } catch (error: any) {
      throw {
        code:
          error.response?.data?.error?.code || error.code || "CV_ANALYZE_ERROR",
        message:
          error.response?.data?.error?.message ||
          error.message ||
          "Gagal menganalisis CV",
        status: error.response?.status || error.status,
        details: error.response?.data?.error?.details || error.details,
      };
    }
  },

  /**
   * Get daftar CV pengguna
   * GET /cvs
   */
  async getCVList(
    page: number = 1,
    limit: number = 10,
  ): Promise<CVListResponse> {
    try {
      const offset = (page - 1) * limit;
      const response = await apiClient.get<ApiResponse<CV[]>>(
        API_ROUTES.CVS.LIST,
        {
          params: { limit, offset },
        },
      );
      const cvs = response.data.data ?? [];
      const meta = response.data.meta ?? {};
      return {
        cvs,
        total: typeof meta.total === "number" ? meta.total : cvs.length,
        page,
        limit: typeof meta.limit === "number" ? meta.limit : limit,
      };
    } catch (error: any) {
      throw {
        code:
          error.response?.data?.error?.code ||
          error.code ||
          "GET_CV_LIST_ERROR",
        message:
          error.response?.data?.error?.message ||
          error.message ||
          "Gagal mengambil daftar CV",
        status: error.response?.status || error.status,
        details: error.response?.data?.error?.details || error.details,
      };
    }
  },

  /**
   * Delete CV
   * DELETE /cvs/:id
   */
  async deleteCV(cvId: string): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<null>>(API_ROUTES.CVS.DELETE(cvId));
    } catch (error: any) {
      throw {
        code:
          error.response?.data?.error?.code || error.code || "DELETE_CV_ERROR",
        message:
          error.response?.data?.error?.message ||
          error.message ||
          "Gagal menghapus CV",
        status: error.response?.status || error.status,
        details: error.response?.data?.error?.details || error.details,
      };
    }
  },
};
