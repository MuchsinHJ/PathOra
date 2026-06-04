
import { logger } from "../../../config/logger.js";
import { NotFoundError } from "../../../exceptions/not-found-error.js";
import { AuthorizationError } from "../../../exceptions/authorization-error.js";
import type { CvFull } from "../../cvs/repositories/cvs.repository.js";
import type { AnalysisSummary } from "../repositories/analyses.repository.js";
import type { AiGatewayAdapter } from "../../ai-gateway/ai-gateway.adapter.js";
import type { AiAnalysisResult } from "../../ai-gateway/ai-response.schema.js";

interface CvsRepo {
  findById(id: string): Promise<CvFull | null>;
  delete(id: string): Promise<void>;
}
interface AnalysesRepo {
  create(data: {
    cv_id: string;
    user_id: string;
    status: "pending";
  }): Promise<AnalysisSummary>;
  update(
    id: string,
    data: {
      status: "success" | "failed";
      predicted_category?: string;
      confidence?: number;
      result?: AiAnalysisResult;
      analyzed_at?: Date;
    },
  ): Promise<AnalysisSummary>;
}
interface TriggerAnalysisDeps {
  cvsRepo: CvsRepo;
  analysesRepo: AnalysesRepo;
  aiGateway: AiGatewayAdapter;
}

export interface TriggerAnalysisResult extends AiAnalysisResult {
  analysisId: string;
}

export function createTriggerAnalysisUseCase({
  cvsRepo,
  analysesRepo,
  aiGateway,
}: TriggerAnalysisDeps) {
  return {

    async execute(
      cvId: string,
      userId: string,
    ): Promise<TriggerAnalysisResult> {
      const cv = await cvsRepo.findById(cvId);
      if (!cv) {
        throw new NotFoundError("CV tidak ditemukan");
      }
      if (cv.user_id !== userId) {
        throw new AuthorizationError("Anda tidak memiliki akses ke CV ini");
      }
      const analysis = await analysesRepo.create({
        cv_id: cvId,
        user_id: userId,
        status: "pending",
      });
      const analysisId = analysis.id;
      const source =
        cv.source_type === "text"
          ? { kind: "text" as const, rawText: cv.raw_text! }
          : {
              kind: "file" as const,
              fileData: cv.file_data!,
              fileMime: cv.file_mime!,
              fileName: cv.file_name ?? undefined,
            };
      let result: AiAnalysisResult;
      try {
        result = await aiGateway.analyze(source, cvId);
      } catch (err) {
        await rollbackUploadedCv({
          cvsRepo,
          analysesRepo,
          cvId,
          analysisId,
          userId,
          err,
        });
        throw err;
      }

      await analysesRepo.update(analysisId, {
        status: "success",
        predicted_category: result.predicted_category,
        confidence: result.confidence,
        result,
        analyzed_at: new Date(),
      });
      return { analysisId, ...result };
    },
  };
}

async function rollbackUploadedCv({
  cvsRepo,
  analysesRepo,
  cvId,
  analysisId,
  userId,
  err,
}: {
  cvsRepo: CvsRepo;
  analysesRepo: AnalysesRepo;
  cvId: string;
  analysisId: string;
  userId: string;
  err: unknown;
}): Promise<void> {
  try {
    await analysesRepo.update(analysisId, { status: "failed" });
  } catch (cleanupErr) {
    logger.error(
      { err: cleanupErr, cvId, analysisId, userId },
      "analysis.mark_failed_failed",
    );
  }

  try {
    await cvsRepo.delete(cvId);
    logger.warn(
      { err, cvId, analysisId, userId },
      "analysis.failed_uploaded_cv_rolled_back",
    );
  } catch (cleanupErr) {
    logger.error(
      { err: cleanupErr, originalErr: err, cvId, analysisId, userId },
      "analysis.rollback_uploaded_cv_failed",
    );
  }
}
