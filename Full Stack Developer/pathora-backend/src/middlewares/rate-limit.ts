
import rateLimit, { type Options } from "express-rate-limit";
import type { Request, Response } from "express";
import { config } from "../config/index.js";
import { response } from "../utils/response.js";

const tooManyRequestsHandler: Options["handler"] = (
  _req: Request,
  res: Response,
) => {
  res
    .status(429)
    .json(response.error("Terlalu banyak permintaan, coba lagi nanti"));
};

export const globalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequestsHandler,
});

export const strictLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.STRICT_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequestsHandler,
});
