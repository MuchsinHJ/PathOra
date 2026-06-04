
import { z } from "zod";

export const AnalysisIdParamSchema = z.object({
  analysisId: z.uuid("analysisId harus berupa UUID yang valid"),
});
export type AnalysisIdParam = z.infer<typeof AnalysisIdParamSchema>;
