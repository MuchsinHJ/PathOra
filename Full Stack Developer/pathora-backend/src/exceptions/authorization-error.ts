
import { HttpException } from "./base-error.js";
export class AuthorizationError extends HttpException {
  constructor(message = "Akses ditolak") {
    super(403, message);
  }
}
