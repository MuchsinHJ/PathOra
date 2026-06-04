
import { HttpException } from "./base-error.js";
export class AuthenticationError extends HttpException {
  constructor(message = "Autentikasi diperlukan") {
    super(401, message);
  }
}
