
import { NotFoundError } from "../../../exceptions/not-found-error.js";
import { AuthorizationError } from "../../../exceptions/authorization-error.js";
import type { CvFull } from "../repositories/cvs.repository.js";

interface CvsRepo {
  findById(id: string): Promise<CvFull | null>;
}
interface GetCvDeps {
  cvsRepo: CvsRepo;
}

export function createGetCvUseCase({ cvsRepo }: GetCvDeps) {
  return {

    async execute(
      cvId: string,
      userId: string,
    ): Promise<Omit<CvFull, "file_data" | "raw_text">> {
      const cv = await cvsRepo.findById(cvId);
      if (!cv) {
        throw new NotFoundError("CV tidak ditemukan");
      }
      if (cv.user_id !== userId) {
        throw new AuthorizationError("Anda tidak memiliki akses ke CV ini");
      }
      const { file_data: _fd, raw_text: _rt, ...safe } = cv;
      return safe;
    },
  };
}
