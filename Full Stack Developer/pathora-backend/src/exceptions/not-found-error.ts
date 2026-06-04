
import { HttpException } from "./base-error.js";
export class NotFoundError extends HttpException {
  constructor(message = "Resource tidak ditemukan") {
    super(404, message);
  }
}
