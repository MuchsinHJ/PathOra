
import type { Request, Response, NextFunction } from "express";
import { response } from "../../../utils/response.js";
import { parsePagination } from "../../../utils/pagination.js";

interface TriggerAnalysisUseCase {
  execute(cvId: string, userId: string): Promise<unknown>;
}
interface GetAnalysisUseCase {
  execute(analysisId: string, userId: string): Promise<unknown>;
}
interface GetLatestByCvUseCase {
  execute(cvId: string, userId: string): Promise<unknown>;
}
interface ListAnalysesUseCase {
  execute(
    userId: string,
    pagination: { limit: number; offset: number },
  ): Promise<{ analyses: unknown[]; meta: unknown }>;
}
interface AnalysesControllerDeps {
  triggerAnalysisUseCase: TriggerAnalysisUseCase;
  getAnalysisUseCase: GetAnalysisUseCase;
  getLatestByCvUseCase: GetLatestByCvUseCase;
  listAnalysesUseCase: ListAnalysesUseCase;
}

export function createAnalysesController({
  triggerAnalysisUseCase,
  getAnalysisUseCase,
  getLatestByCvUseCase,
  listAnalysesUseCase,
}: AnalysesControllerDeps) {

  async function trigger(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { cvId } = req.params as { cvId: string };
      const result = await triggerAnalysisUseCase.execute(cvId, req.user!.id);
      res.status(200).json(response.success(result));
    } catch (err) {
      next(err);
    }
  }

  async function getOne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { analysisId } = req.params as { analysisId: string };
      const analysis = await getAnalysisUseCase.execute(
        analysisId,
        req.user!.id,
      );
      res.status(200).json(response.success(analysis));
    } catch (err) {
      next(err);
    }
  }

  async function getLatestByCv(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { cvId } = req.params as { cvId: string };
      const analysis = await getLatestByCvUseCase.execute(cvId, req.user!.id);
      res.status(200).json(response.success(analysis));
    } catch (err) {
      next(err);
    }
  }

  async function list(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const pagination = parsePagination(req.query as Record<string, unknown>);
      const result = await listAnalysesUseCase.execute(userId, pagination);
      res
        .status(200)
        .json(
          response.success(
            result.analyses,
            result.meta as Record<string, unknown>,
          ),
        );
    } catch (err) {
      next(err);
    }
  }
  return { trigger, getOne, getLatestByCv, list };
}
