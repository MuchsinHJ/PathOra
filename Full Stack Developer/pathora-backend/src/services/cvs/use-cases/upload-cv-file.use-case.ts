
import type { Cv, CreateCvFileDto } from "../repositories/cvs.repository.js";

interface CvsRepo {
  create(data: CreateCvFileDto): Promise<Cv>;
}
interface UploadCvFileDeps {
  cvsRepo: CvsRepo;
}

export interface UploadCvFileInput {
  userId: string;
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}

export function createUploadCvFileUseCase({ cvsRepo }: UploadCvFileDeps) {
  return {

    async execute({
      userId,
      buffer,
      mimeType,
      fileName,
    }: UploadCvFileInput): Promise<Cv> {
      return cvsRepo.create({
        user_id: userId,
        source_type: "file",
        file_name: fileName,
        file_mime: mimeType,
        file_data: buffer,
      });
    },
  };
}
