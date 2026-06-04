
import { HttpException } from "./base-error.js";
export class ConflictError extends HttpException {
  constructor(message = "Konflik dengan data yang sudah ada") {
    super(409, message);
  }
}
