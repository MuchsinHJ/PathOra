
import {
  AiResponseSchema,
  type AiAnalysisResult,
} from "../services/ai-gateway/ai-response.schema.js";
import { AiGatewayError } from "../exceptions/ai-gateway-error.js";
import { z } from "zod";

export function validateAiResponse(data: unknown): AiAnalysisResult {
  const parsed = AiResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new AiGatewayError(
      "invalid_response",
      "Respons AI tidak sesuai schema yang diharapkan",
      z.treeifyError(parsed.error),
    );
  }
  return parsed.data;
}
