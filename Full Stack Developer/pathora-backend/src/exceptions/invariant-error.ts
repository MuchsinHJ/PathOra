
import { HttpException } from "./base-error.js";
export class InvariantError extends HttpException {
  constructor(message = "Kondisi tidak terpenuhi", details?: unknown) {
    super(422, message, details);
  }
}
