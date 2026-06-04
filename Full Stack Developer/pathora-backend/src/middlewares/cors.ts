
import cors from "cors";
import { config } from "../config/index.js";
export const corsMiddleware = cors({
  origin: config.ALLOWED_ORIGINS,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
