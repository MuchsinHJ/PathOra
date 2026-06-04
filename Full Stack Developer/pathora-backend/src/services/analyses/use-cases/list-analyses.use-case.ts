
import type { AnalysisSummary } from "../repositories/analyses.repository.js";
import type {
  PaginationParams,
  PaginationMeta,
} from "../../../utils/pagination.js";

interface AnalysesRepo {
  findByUser(
    userId: string,
    pagination: PaginationParams,
  ): Promise<AnalysisSummary[]>;
}
interface ListAnalysesDeps {
  analysesRepo: AnalysesRepo;
}

export interface ListAnalysesResult {
  analyses: AnalysisSummary[];
  meta: PaginationMeta;
}

export function createListAnalysesUseCase({ analysesRepo }: ListAnalysesDeps) {
  return {

    async execute(
      userId: string,
      pagination: PaginationParams,
    ): Promise<ListAnalysesResult> {
      const analyses = await analysesRepo.findByUser(userId, pagination);
      return {
        analyses,
        meta: { limit: pagination.limit, offset: pagination.offset },
      };
    },
  };
}
