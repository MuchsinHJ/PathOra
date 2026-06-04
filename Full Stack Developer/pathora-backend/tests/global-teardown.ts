
import { Pool } from "pg";
import path from "path";
import dotenv from "dotenv";
export default async function globalTeardown() {
  dotenv.config({ path: path.resolve(__dirname, "../.env.test") });
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) return;
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    await pool.end();
  } catch {
  }
}
