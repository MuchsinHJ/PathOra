export const ENV = {
  API_BASE_URL:
    (import.meta.env.VITE_API_BASE_URL as string) ||
    "http://localhost:3000/api/v1",
  AI_TIMEOUT_MS: Number(import.meta.env.VITE_AI_TIMEOUT_MS ?? 35000),
} as const;

if (!ENV.API_BASE_URL) {
  console.warn(
    "[ENV] VITE_API_BASE_URL belum dikonfigurasi. Menggunakan default localhost.",
  );
}
