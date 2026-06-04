
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { nanoid } from "nanoid";
import { corsMiddleware } from "./middlewares/cors.js";
import { globalLimiter } from "./middlewares/rate-limit.js";
import { errorHandler } from "./middlewares/error.js";
import { response } from "./utils/response.js";
import apiRouter from "./routes/index.js";

export function createApp() {
  const app = express();
  app.use(corsMiddleware);
  app.use(express.json({ limit: "10mb" }));
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as Request & { id: string }).id = nanoid(10);
    next();
  });
  app.use(globalLimiter);
  app.use("/api/v1", apiRouter);
  app.use((_req: Request, res: Response) => {
    res.status(404).json(response.error("Endpoint tidak ditemukan"));
  });
  app.use(errorHandler);
  return app;
}
