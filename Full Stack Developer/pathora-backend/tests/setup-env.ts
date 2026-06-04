
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

process.env["NODE_ENV"] ??= "test";
process.env["DATABASE_URL"] ??=
  "postgresql://test:test@localhost:5432/pathora_test";
process.env["JWT_SECRET"] ??=
  "test_jwt_secret_minimal_32_karakter_untuk_testing";
process.env["JWT_EXPIRES_IN"] ??= "1h";
process.env["USE_MOCK_AI"] ??= "true";
process.env["ALLOWED_ORIGINS"] ??= "http://localhost:5173";
process.env["LOG_LEVEL"] ??= "info";
