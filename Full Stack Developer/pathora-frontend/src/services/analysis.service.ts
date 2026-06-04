import { apiClient } from "./api.client";
import { API_ROUTES } from "../constants/api-routes";
import { ApiResponse } from "../types/api";
import {
  Analysis,
  AnalysisListResponse,
  AnalysisResult,
  AnalyzeResponse,
} from "../types/analysis";

type BackendSkill = string | { skill?: string; name?: string };

type BackendPrediction = {
  category: string;
  confidence?: number;
  score?: number;
  matched_skills?: BackendSkill[];
  match_skills?: BackendSkill[];
  missing_skills?: BackendSkill[];
};

type BackendExtractedSkills = {
  category?: string;
  matched_skills?: BackendSkill[];
  match_skills?: BackendSkill[];
  missing_skills?: BackendSkill[];
};

type BackendAnalysisResult = Partial<AnalysisResult> & {
  top_5_predictions?: BackendPrediction[];
  extracted_skills?: BackendExtractedSkills[];
  match_skills?: BackendSkill[];
};

type BackendAnalysis = Partial<Analysis> & {
  analysisId?: string;
  result?: BackendAnalysisResult | null;
  top_5_predictions?: BackendPrediction[];
  extracted_skills?: BackendExtractedSkills[];
  match_skills?: BackendSkill[];
  career_recommendations?: AnalysisResult["career_recommendations"];
  description_career_recommendations?: string;
};

const skillName = (skill: BackendSkill): string =>
  typeof skill === "string" ? skill : skill.skill ?? skill.name ?? "";

const normalizeSkills = (skills?: BackendSkill[]): string[] =>
  (skills ?? []).map(skillName).filter(Boolean);

const firstNonEmpty = (...skillGroups: string[][]): string[] =>
  skillGroups.find((skills) => skills.length > 0) ?? [];

const findExtractedSkillsByCategory = (
  extractedSkills: BackendExtractedSkills[],
  category?: string,
): BackendExtractedSkills | undefined =>
  extractedSkills.find((item) => item.category === category);

const normalizeConfidence = (value: unknown): number => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : 0;

  return Number.isFinite(parsed) ? parsed : 0;
};

export const normalizeAnalysis = (analysis: BackendAnalysis): Analysis => {
  const result = analysis.result;
  const rawTopPredictions =
    result?.top_5_predictions ?? analysis.top_5_predictions ?? [];
  const topPredictions =
    result?.top_predictions ??
    rawTopPredictions.map((prediction) => ({
      category: prediction.category,
      score: prediction.score ?? prediction.confidence ?? 0,
      confidence: prediction.confidence ?? prediction.score ?? 0,
      matched_skills: normalizeSkills(
        prediction.matched_skills ?? prediction.match_skills,
      ),
      missing_skills: normalizeSkills(prediction.missing_skills),
    }));
  const topCategory =
    topPredictions[0]?.category ??
    result?.predicted_category ??
    analysis.predicted_category;
  const extractedSkills = result?.extracted_skills ?? analysis.extracted_skills ?? [];
  const topExtracted =
    extractedSkills.find((item) => item.category === topCategory) ??
    extractedSkills[0];
  const topPredictionSkills = topPredictions[0];
  const matchedSkills = firstNonEmpty(
    result?.matched_skills ?? [],
    normalizeSkills(result?.match_skills),
    topPredictionSkills?.matched_skills ?? [],
    normalizeSkills(topExtracted?.matched_skills ?? topExtracted?.match_skills),
  );
  const missingSkills = firstNonEmpty(
    result?.missing_skills ?? [],
    topPredictionSkills?.missing_skills ?? [],
    normalizeSkills(topExtracted?.missing_skills),
  );
  const careerRecommendations = (
    result?.career_recommendations ??
    analysis.career_recommendations ??
    []
  ).map((recommendation) => {
    const extracted = findExtractedSkillsByCategory(
      extractedSkills,
      recommendation.category,
    );
    const prediction = topPredictions.find(
      (item) => item.category === recommendation.category,
    );

    return {
      ...recommendation,
      matched_skills: firstNonEmpty(
        recommendation.matched_skills ?? [],
        prediction?.matched_skills ?? [],
        normalizeSkills(extracted?.matched_skills ?? extracted?.match_skills),
      ),
      missing_skills: firstNonEmpty(
        recommendation.missing_skills ?? [],
        prediction?.missing_skills ?? [],
        normalizeSkills(extracted?.missing_skills),
      ),
    };
  });

  const normalizedResult: AnalysisResult | null =
    result || analysis.predicted_category || topPredictions.length > 0
      ? {
          predicted_category:
            result?.predicted_category ??
            analysis.predicted_category ??
            topPredictions[0]?.category ??
            "",
          confidence: normalizeConfidence(
            result?.confidence ?? analysis.confidence,
          ),
          top_predictions: topPredictions,
          career_recommendations: careerRecommendations,
          description_career_recommendations:
            result?.description_career_recommendations ??
            analysis.description_career_recommendations ??
            "",
          matched_skills: matchedSkills,
          missing_skills: missingSkills,
        }
      : null;

  return {
    id: analysis.id ?? analysis.analysisId ?? "",
    cv_id: analysis.cv_id ?? "",
    user_id: analysis.user_id ?? "",
    status: analysis.status ?? "success",
    predicted_category:
      analysis.predicted_category ?? normalizedResult?.predicted_category ?? "",
    confidence: normalizeConfidence(
      analysis.confidence ?? normalizedResult?.confidence,
    ),
    result: normalizedResult,
    analyzed_at: analysis.analyzed_at,
    created_at: analysis.created_at ?? analysis.analyzed_at ?? "",
  };
};

export const normalizeAnalyzeResponse = (
  analysis: BackendAnalysis,
): AnalyzeResponse => {
  const normalized = normalizeAnalysis(analysis);
  return {
    id: normalized.id,
    status: normalized.status,
    result: normalized.result,
    predicted_category: normalized.predicted_category,
    confidence: normalized.confidence,
  };
};

export const analysisService = {
  /**
   * Get hasil analisis berdasarkan ID
   * GET /analyses/:id
   */
  async getAnalysis(analysisId: string): Promise<Analysis> {
    try {
      const response = await apiClient.get<ApiResponse<Analysis>>(
        API_ROUTES.ANALYSES.GET(analysisId),
      );
      if (!response.data.data) {
        throw new Error("Analysis response tidak valid");
      }
      return normalizeAnalysis(response.data.data);
    } catch (error: any) {
      throw {
        code:
          error.response?.data?.error?.code ||
          error.code ||
          "GET_ANALYSIS_ERROR",
        message:
          error.response?.data?.error?.message ||
          error.message ||
          "Gagal mengambil hasil analisis",
      };
    }
  },

  /**
   * Get daftar semua analisis pengguna
   * GET /analyses
   */
  async getAnalyses(
    page: number = 1,
    limit: number = 10,
  ): Promise<AnalysisListResponse> {
    try {
      const offset = (page - 1) * limit;
      const response = await apiClient.get<ApiResponse<Analysis[]>>(
        API_ROUTES.ANALYSES.LIST,
        {
          params: { limit, offset },
        },
      );

      const analyses = (response.data.data ?? []).map(normalizeAnalysis);
      const meta = response.data.meta ?? {};

      return {
        analyses,
        total: typeof meta.total === "number" ? meta.total : analyses.length,
        page,
        limit: typeof meta.limit === "number" ? meta.limit : limit,
      };
    } catch (error: any) {
      throw {
        code:
          error.response?.data?.error?.code ||
          error.code ||
          "GET_ANALYSES_ERROR",
        message:
          error.response?.data?.error?.message ||
          error.message ||
          "Gagal mengambil daftar analisis",
      };
    }
  },

  /**
   * Get analysis history untuk dashboard
   * GET /analyses?limit=5 (most recent)
   */
  async getAnalysisHistory(limit: number = 5): Promise<AnalysisListResponse> {
    return this.getAnalyses(1, limit);
  },

  /**
   * Get semua analisis pengguna untuk halaman utama dengan pagination client-side.
   * Backend tetap dipanggil per batch agar mengikuti kontrak limit/offset.
   */
  async getAllAnalyses(batchSize: number = 50): Promise<Analysis[]> {
    const firstPage = await this.getAnalyses(1, batchSize);
    const analyses = [...firstPage.analyses];
    const totalPages = Math.ceil(firstPage.total / batchSize);

    for (let page = 2; page <= totalPages; page += 1) {
      const nextPage = await this.getAnalyses(page, batchSize);
      analyses.push(...nextPage.analyses);
    }

    const detailedAnalyses = await Promise.all(
      analyses.map(async (analysis) => {
        if (!analysis.id) return analysis;

        try {
          return await this.getAnalysis(analysis.id);
        } catch {
          return analysis;
        }
      }),
    );

    return detailedAnalyses;
  },

  /**
   * Get latest analysis by CV ID
   * GET /cvs/:cvId/analysis
   */
  async getLatestByCv(cvId: string): Promise<Analysis> {
    try {
      const response = await apiClient.get<ApiResponse<Analysis>>(
        API_ROUTES.CVS.LATEST_ANALYSIS(cvId),
      );
      if (!response.data.data) {
        throw new Error("Latest analysis response tidak valid");
      }
      return normalizeAnalysis(response.data.data);
    } catch (error: any) {
      throw {
        code:
          error.response?.data?.error?.code ||
          error.code ||
          "GET_ANALYSIS_ERROR",
        message:
          error.response?.data?.error?.message ||
          error.message ||
          "Gagal mengambil hasil analisis",
      };
    }
  },
};
