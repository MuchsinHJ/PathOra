
import type { Cv } from "../repositories/cvs.repository.js";
import type {
  PaginationParams,
  PaginationMeta,
} from "../../../utils/pagination.js";

interface CvsRepo {
  findByUser(userId: string, pagination: PaginationParams): Promise<Cv[]>;
}
interface ListCvsDeps {
  cvsRepo: CvsRepo;
}

export interface ListCvsResult {
  cvs: Cv[];
  meta: PaginationMeta;
}

export function createListCvsUseCase({ cvsRepo }: ListCvsDeps) {
  return {

    async execute(
      userId: string,
      pagination: PaginationParams,
    ): Promise<ListCvsResult> {
      const cvs = await cvsRepo.findByUser(userId, pagination);
      return {
        cvs,
        meta: { limit: pagination.limit, offset: pagination.offset },
      };
    },
  };
}
