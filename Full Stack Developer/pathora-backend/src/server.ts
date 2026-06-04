
import { config } from "./config/index.js";
import { testConnection, closePool } from "./config/database.js";
import { logger } from "./config/logger.js";
import { createApp } from "./app.js";

async function start() {
  try {
    await testConnection();
  } catch (err) {
    logger.error({ err }, "server.startup — koneksi DB gagal");
    process.exit(1);
  }
  const app = createApp();
  const server = app.listen(config.PORT, () => {
    logger.info(
      { port: config.PORT, env: config.NODE_ENV },
      `server.listening — Path\`Ora Backend berjalan di port ${config.PORT}`,
    );
  });
  async function shutdown(signal: string) {
    logger.info(
      { signal },
      "server.shutdown — menerima sinyal, mulai shutdown",
    );
    server.close(async () => {
      logger.info("server.shutdown — HTTP server ditutup");
      try {
        await closePool();
      } catch (err) {
        logger.error({ err }, "server.shutdown — gagal menutup pool DB");
      }
      logger.info("server.shutdown — selesai");
      process.exit(0);
    });
    setTimeout(() => {
      logger.error("server.shutdown — timeout, force exit");
      process.exit(1);
    }, 10_000).unref();
  }
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

start().catch((err: unknown) => {
  console.error("[server] Fatal error saat startup:", err);
  process.exit(1);
});
