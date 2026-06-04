
import type { AnalysisSummary } from "../repositories/dashboard.repository.js";

interface DashboardRepo {
  getLastAnalysis(userId: string): Promise<AnalysisSummary | null>;
  getRecentHistory(userId: string, limit: number): Promise<AnalysisSummary[]>;
}
interface GetDashboardDeps {
  dashboardRepo: DashboardRepo;
}

export interface DashboardData {
  lastAnalysis: AnalysisSummary | null;
  recentHistory: AnalysisSummary[];
}

const RECENT_HISTORY_LIMIT = 5;
export function createGetDashboardUseCase({ dashboardRepo }: GetDashboardDeps) {
  return {

    async execute(userId: string): Promise<DashboardData> {
      const [lastAnalysis, recentHistory] = await Promise.all([
        dashboardRepo.getLastAnalysis(userId),
        dashboardRepo.getRecentHistory(userId, RECENT_HISTORY_LIMIT),
      ]);
      return { lastAnalysis, recentHistory };
    },
  };
}
