
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import { runner } from "node-pg-migrate";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("[migrate] ERROR: DATABASE_URL tidak ditemukan di .env");
  process.exit(1);
}
const rootDir = path.resolve(__dirname, "..");
const migrationsDir = path.resolve(rootDir, "migrations");
const baseOptions = {
  databaseUrl: DATABASE_URL,
  migrationsTable: "pgmigrations",
  dir: migrationsDir,
  ignorePattern: "^(?!.*\.cjs$).*",
  verbose: true,
};
const [, , command = "up", ...rest] = process.argv;
async function main() {
  try {
    switch (command) {
      case "up": {
        console.log("[migrate] Menjalankan migrasi UP...");
        await runner({ ...baseOptions, direction: "up", count: Infinity });
        console.log("[migrate] Selesai UP.");
        break;
      }
      case "down": {
        const count = rest[0] ? Number(rest[0]) : 1;
        console.log(`[migrate] Menjalankan migrasi DOWN (${count} langkah)...`);
        await runner({ ...baseOptions, direction: "down", count });
        console.log("[migrate] Selesai DOWN.");
        break;
      }
      case "redo": {
        const count = rest[0] ? Number(rest[0]) : 1;
        console.log(`[migrate] REDO: down ${count} lalu up ${count}...`);
        await runner({ ...baseOptions, direction: "down", count });
        await runner({ ...baseOptions, direction: "up", count });
        console.log("[migrate] Selesai REDO.");
        break;
      }
      case "create": {
        const name = rest.join("-");
        if (!name) {
          console.error("[migrate] ERROR: Berikan nama migrasi.");
          process.exit(1);
        }
        console.log(`[migrate] Membuat file migrasi: ${name}`);
        await runner({
          ...baseOptions,
          direction: "up",
          action: "create",
          migrationFileName: name,
        });
        console.log("[migrate] File migrasi berhasil dibuat.");
        break;
      }
      default: {
        console.error(`[migrate] Perintah tidak dikenal: "${command}"`);
        process.exit(1);
      }
    }
  } catch (err) {
    console.error("[migrate] GAGAL:", err.message ?? err);
    process.exit(1);
  }
}
main();
