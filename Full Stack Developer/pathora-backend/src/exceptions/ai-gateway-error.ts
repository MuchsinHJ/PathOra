
import { HttpException } from "./base-error.js";
export type AiErrorType = "timeout" | "upstream_error" | "invalid_response";
const HTTP_STATUS: Record<AiErrorType, number> = {
  timeout: 504,
  upstream_error: 502,
  invalid_response: 422,
};
const DEFAULT_MESSAGE: Record<AiErrorType, string> = {
  timeout: "Layanan AI tidak merespons dalam batas waktu yang ditentukan",
  upstream_error: "Layanan AI mengalami kesalahan internal",
  invalid_response:
    "Respons dari layanan AI tidak sesuai format yang diharapkan",
};
export class AiGatewayError extends HttpException {
  constructor(
    public readonly type: AiErrorType,
    message?: string,
    details?: unknown,
  ) {
    super(HTTP_STATUS[type], message ?? DEFAULT_MESSAGE[type], details);
  }
}
