
import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ClientError } from "../exceptions/client-error.js";
type ValidationSource = "body" | "params" | "query";

export function validate(schema: ZodSchema, source: ValidationSource = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        new ClientError("Validasi gagal", result.error.flatten().fieldErrors),
      );
    }
    (req as unknown as Record<string, unknown>)[source] = result.data;
    next();
  };
}
