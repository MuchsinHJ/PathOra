
import { HttpException } from "./base-error.js";
export class ClientError extends HttpException {
  constructor(message = "Input tidak valid", details?: unknown) {
    super(422, message, details);
  }
}
