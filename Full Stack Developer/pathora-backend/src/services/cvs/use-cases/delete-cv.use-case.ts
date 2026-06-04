
import { NotFoundError } from "../../../exceptions/not-found-error.js";
import { AuthorizationError } from "../../../exceptions/authorization-error.js";
import type { Cv } from "../repositories/cvs.repository.js";

interface CvsRepo {
  findById(id: string): Promise<Cv | null>;
  delete(id: string): Promise<void>;
}
interface DeleteCvDeps {
  cvsRepo: CvsRepo;
}

export function createDeleteCvUseCase({ cvsRepo }: DeleteCvDeps) {
  return {

    async execute(cvId: string, userId: string): Promise<void> {
      const cv = await cvsRepo.findById(cvId);
      if (!cv) {
        throw new NotFoundError("CV tidak ditemukan");
      }
      if (cv.user_id !== userId) {
        throw new AuthorizationError("Anda tidak memiliki akses ke CV ini");
      }
      await cvsRepo.delete(cvId);
    },
  };
}
