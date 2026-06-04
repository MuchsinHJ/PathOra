
import { ClientError } from "../../../exceptions/client-error.js";
import type { Cv, CreateCvTextDto } from "../repositories/cvs.repository.js";

interface CvsRepo {
  create(data: CreateCvTextDto): Promise<Cv>;
}
interface UploadCvTextDeps {
  cvsRepo: CvsRepo;
}

export interface UploadCvTextInput {
  userId: string;
  raw_text: string;
}

export function createUploadCvTextUseCase({ cvsRepo }: UploadCvTextDeps) {
  return {

    async execute({ userId, raw_text }: UploadCvTextInput): Promise<Cv> {
      // if (raw_text.trim().length < 100) {
      //   throw new ClientError("Teks CV minimal 100 karakter");
      // }
      return cvsRepo.create({
        user_id: userId,
        source_type: "text",
        raw_text,
      });
    },
  };
}
