
import pino from "pino";
import { config } from "./index.js";

let transport: ReturnType<typeof pino.transport> | undefined;
if (config.NODE_ENV === "development") {
  try {
    require.resolve("pino-pretty");
    transport = pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:HH:MM:ss.l",
        ignore: "pid,hostname",
        messageFormat: "{msg}",
      },
    });
  } catch {
  }
}

export const logger = pino(
  {
    // level: config.IS_TEST ? "silent" : config.LOG_LEVEL,
    level: config.LOG_LEVEL,
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
    },
    base: {
      env: config.NODE_ENV,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        "password",
        "password_hash",
        "token",
        "authorization",
        "req.headers.authorization",
        "body.password",
        "*.password",
        "*.password_hash",
        "*.token",
      ],
      censor: "[REDACTED]",
    },
  },
  transport,
);

export function createLogger(module: string) {
  return logger.child({ module });
}
