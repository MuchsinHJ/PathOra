
import type { Request, Response, NextFunction } from "express";
import { tokenManager, type TokenPayload } from "../security/token-manager.js";
import { AuthenticationError } from "../exceptions/authentication-error.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function auth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AuthenticationError("Token tidak ditemukan"));
  }
  const token = header.slice(7);
  try {
    req.user = tokenManager.verify(token);
    next();
  } catch {
    next(new AuthenticationError("Token tidak valid atau kedaluwarsa"));
  }
}
