
import type { Request, Response, NextFunction } from "express";
import { HttpException } from "../exceptions/base-error.js";
import { response } from "../utils/response.js";
import { logger } from "../config/logger.js";
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpException) {
    res.status(err.statusCode).json(response.error(err.message, err.details));
    return;
  }
  logger.error(
    {
      err,
      reqId: (req as Request & { id?: string }).id,
      method: req.method,
      url: req.originalUrl,
    },
    "unhandled.error",
  );
  res.status(500).json(response.error("Terjadi kesalahan pada server"));
}
