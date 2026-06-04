import axios from "axios";
import FormData from "form-data";
import { config } from "../../config/index.js";
import { validateAiResponse } from "../../utils/ai-schema-validator.js";
import { AiGatewayError } from "../../exceptions/ai-gateway-error.js";
import type { AiGatewayAdapter, CvSource } from "./ai-gateway.adapter.js";
import type { AiAnalysisResult } from "./ai-response.schema.js";

export class HttpAiGateway implements AiGatewayAdapter {
  async analyze(source: CvSource, cvId: string): Promise<AiAnalysisResult> {
    try {
      let responseData: unknown;

      if (source.kind === "text") {
        // AI mengharapkan application/x-www-form-urlencoded dengan field "text"
        const params = new URLSearchParams();
        params.append("text", source.rawText);
        params.append("gemini_api_key", config.AI_API_KEY ?? "");

        const { data } = await axios.post(
          `${config.AI_BASE_URL}/predict`,
          params,
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            timeout: config.AI_TIMEOUT_MS,
          },
        );
        responseData = data;
      } else {
        // Upload file: kirim sebagai multipart/form-data
        const form = new FormData();
        form.append("file", source.fileData, {
          filename: source.fileName ?? "cv",
          contentType: source.fileMime,
        });
        form.append("gemini_api_key", config.AI_API_KEY ?? "");

        const { data } = await axios.post(
          `${config.AI_BASE_URL}/predict/file`,
          form,
          {
            headers: form.getHeaders(),
            timeout: config.AI_TIMEOUT_MS,
          },
        );
        responseData = data;
      }

      // Response AI bisa berupa string JSON — parse dulu bila perlu
      const parsed =
        typeof responseData === "string"
          ? (JSON.parse(responseData) as unknown)
          : responseData;

      // Tambahkan cv_id & analyzed_at bila AI tidak mengembalikannya
      const normalized =
        parsed !== null && typeof parsed === "object"
          ? {
              cv_id: cvId,
              analyzed_at: new Date().toISOString(),
              ...(parsed as Record<string, unknown>),
            }
          : parsed;

      return validateAiResponse(normalized);
    } catch (err) {
      if (err instanceof AiGatewayError) throw err;
      if (err instanceof SyntaxError) {
        throw new AiGatewayError(
          "invalid_response",
          "Respons AI bukan JSON yang valid",
        );
      }
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED" || err.code === "ERR_CANCELED") {
          throw new AiGatewayError(
            "timeout",
            `Layanan AI tidak merespons dalam ${config.AI_TIMEOUT_MS}ms`,
          );
        }
        if ((err.response?.status ?? 0) >= 500) {
          throw new AiGatewayError(
            "upstream_error",
            `Layanan AI mengembalikan error ${err.response?.status ?? "unknown"}`,
          );
        }
        if ((err.response?.status ?? 0) >= 400) {
          throw new AiGatewayError(
            "upstream_error",
            `Layanan AI menolak request: ${err.response?.status ?? "unknown"}`,
            err.response?.data,
          );
        }
      }
      throw new AiGatewayError(
        "upstream_error",
        "Kegagalan tak terduga saat menghubungi layanan AI",
      );
    }
  }
}
