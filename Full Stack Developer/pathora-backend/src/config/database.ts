
import { Pool, type QueryResultRow } from "pg";
import { config } from "./index.js";
import { logger } from "./logger.js";

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: config.IS_PRODUCTION ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => {
  logger.error({ err }, "db.pool.error — koneksi idle mengalami error");
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    logger.debug(
      {
        query: text.slice(0, 120),
        durationMs: Date.now() - start,
        rowCount: result.rowCount,
      },
      "db.query.ok",
    );
    return result;
  } catch (err) {
    logger.error(
      {
        query: text.slice(0, 120),
        durationMs: Date.now() - start,
        err,
      },
      "db.query.error",
    );
    throw err;
  }
}

export async function testConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    logger.info("db.connection — PostgreSQL terhubung");
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
  logger.info("db.pool — koneksi ditutup");
}
