
import { z } from "zod";

export const UploadCvTextSchema = z.object({
  source_type: z.literal("text"),
  raw_text: z.string().min(100, "Teks CV minimal 100 karakter"),
});
export type UploadCvTextDto = z.infer<typeof UploadCvTextSchema>;

export const CvIdParamSchema = z.object({
  cvId: z.uuid("cvId harus berupa UUID yang valid"),
});
export type CvIdParam = z.infer<typeof CvIdParamSchema>;
