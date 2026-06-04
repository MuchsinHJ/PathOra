
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const EnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),
    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET minimal 32 karakter untuk keamanan"),
    JWT_EXPIRES_IN: z.string().default("7d"),
    AI_BASE_URL: z.string().optional(),
    AI_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
    AI_API_KEY: z.string().optional(),
    USE_MOCK_AI: z.coerce.boolean().default(false),
    ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),
    MAX_FILE_SIZE_MB: z.coerce.number().positive().default(5),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    STRICT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace"])
      .default("info"),
  })
  .refine((c) => c.USE_MOCK_AI || !!c.AI_BASE_URL, {
    message:
      "AI_BASE_URL wajib diisi bila USE_MOCK_AI=false. " +
      "Set USE_MOCK_AI=true untuk mode development tanpa layanan AI.",
    path: ["AI_BASE_URL"],
  });

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    "[CONFIG] ❌ Environment variable tidak valid. Server tidak dapat dimulai.\n",
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
  );
  process.exit(1);
}
const env = parsed.data;

export const config = {
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
  IS_PRODUCTION: env.NODE_ENV === "production",
  IS_TEST: env.NODE_ENV === "test",
  DATABASE_URL: env.DATABASE_URL,
  JWT_SECRET: env.JWT_SECRET,
  JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
  AI_BASE_URL: env.AI_BASE_URL,
  AI_TIMEOUT_MS: env.AI_TIMEOUT_MS,
  AI_API_KEY: env.AI_API_KEY,
  USE_MOCK_AI: env.USE_MOCK_AI,
  ALLOWED_ORIGINS: env.ALLOWED_ORIGINS.split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  MAX_FILE_SIZE_BYTES: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  MAX_FILE_SIZE_MB: env.MAX_FILE_SIZE_MB,
  RATE_LIMIT_WINDOW_MS: env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX: env.RATE_LIMIT_MAX,
  STRICT_RATE_LIMIT_MAX: env.STRICT_RATE_LIMIT_MAX,
  LOG_LEVEL: env.LOG_LEVEL,
} as const;
export type Config = typeof config;
