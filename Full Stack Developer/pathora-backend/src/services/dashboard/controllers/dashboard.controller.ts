
import type { Request, Response, NextFunction } from "express";
import { response } from "../../../utils/response.js";
import type { DashboardData } from "../use-cases/get-dashboard.use-case.js";

interface GetDashboardUseCase {
  execute(userId: string): Promise<DashboardData>;
}
interface DashboardControllerDeps {
  getDashboardUseCase: GetDashboardUseCase;
}

export function createDashboardController({
  getDashboardUseCase,
}: DashboardControllerDeps) {

  async function getMyDashboard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await getDashboardUseCase.execute(req.user!.id);
      res.status(200).json(response.success(data));
    } catch (err) {
      next(err);
    }
  }
  return { getMyDashboard };
}
