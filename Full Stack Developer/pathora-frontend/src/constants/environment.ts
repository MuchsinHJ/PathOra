export const ENV = {
  API_BASE_URL:
    (import.meta.env.VITE_API_BASE_URL as string) ||
    "http://localhost:3000/api/v1",
  AI_TIMEOUT_MS: Number(import.meta.env.VITE_AI_TIMEOUT_MS ?? 35000),
  // AI service masih tahap perbaikan. Set "true" untuk mengaktifkan lagi.
  AI_FEATURE_ENABLED:
    (import.meta.env.VITE_AI_FEATURE_ENABLED ?? "false") === "true",
} as const;

if (!ENV.API_BASE_URL) {
  console.warn(
    "[ENV] VITE_API_BASE_URL belum dikonfigurasi. Menggunakan default localhost.",
  );
}

/** Pesan seragam saat endpoint AI belum siap dipakai. */
export const FEATURE_IN_DEVELOPMENT_MESSAGE =
  "Fitur sedang dalam tahap pengembangan";
