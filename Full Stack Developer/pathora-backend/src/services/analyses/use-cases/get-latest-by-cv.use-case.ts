
import { NotFoundError } from "../../../exceptions/not-found-error.js";
import { AuthorizationError } from "../../../exceptions/authorization-error.js";
import type { Analysis } from "../repositories/analyses.repository.js";
import type { AiAnalysisResult } from "../../ai-gateway/ai-response.schema.js";

interface CvsRepo {
  findById(id: string): Promise<{ user_id: string } | null>;
}
interface AnalysesRepo {
  findLatestByCvId(cvId: string): Promise<Analysis | null>;
}
interface GetLatestByCvDeps {
  cvsRepo: CvsRepo;
  analysesRepo: AnalysesRepo;
}

const CONFIDENCE_THRESHOLD = 0.05;
const MATCH_SCORE_THRESHOLD = 0.3;
function applyFilters(result: AiAnalysisResult): AiAnalysisResult {
  return {
    ...result,
    top_5_predictions: result.top_5_predictions
      .filter((p) => p.confidence > CONFIDENCE_THRESHOLD)
      .sort((a, b) => b.confidence - a.confidence),
    extracted_skills: result.extracted_skills.map((skill) => ({
      ...skill,
      matched_skills: [...skill.matched_skills].sort(
        (a, b) => b.similarity - a.similarity,
      ),
    })),
    career_recommendations: result.career_recommendations
      .filter((r) => r.match_score > MATCH_SCORE_THRESHOLD)
      .sort((a, b) => b.match_score - a.match_score),
  };
}

export function createGetLatestByCvUseCase({
  cvsRepo,
  analysesRepo,
}: GetLatestByCvDeps) {
  return {
    async execute(cvId: string, userId: string): Promise<Analysis> {
      const cv = await cvsRepo.findById(cvId);
      if (!cv) throw new NotFoundError("CV tidak ditemukan");
      if (cv.user_id !== userId)
        throw new AuthorizationError("Anda tidak memiliki akses ke CV ini");
      const analysis = await analysesRepo.findLatestByCvId(cvId);
      if (!analysis) throw new NotFoundError("Belum ada analisis untuk CV ini");
      if (analysis.result) {
        return { ...analysis, result: applyFilters(analysis.result) };
      }
      return analysis;
    },
  };
}
