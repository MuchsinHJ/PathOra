
import type { Request, Response } from "express";
import { pool } from "../../config/database.js";
import { response } from "../../utils/response.js";
import { logger } from "../../config/logger.js";

interface HealthStatus {
  status: "ok" | "degraded";
  db: "ok" | "error";
  timestamp: string;
}

export async function healthCheck(_req: Request, res: Response): Promise<void> {
  const timestamp = new Date().toISOString();
  try {
    await pool.query("SELECT 1");
    const status: HealthStatus = { status: "ok", db: "ok", timestamp };
    res.status(200).json(response.success(status));
  } catch (err) {
    logger.error({ err }, "health.check.db_error");
    const status: HealthStatus = { status: "degraded", db: "error", timestamp };
    res.status(503).json(response.success(status));
  }
}
