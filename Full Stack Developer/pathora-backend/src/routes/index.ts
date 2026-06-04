
import { Router } from "express";
import authRouter from "../services/auth/routes/auth.route.js";
import usersRouter from "../services/users/routes/users.route.js";
import cvsRouter from "../services/cvs/routes/cvs.route.js";
import analysesRouter from "../services/analyses/routes/analyses.route.js";
import dashboardRouter from "../services/dashboard/routes/dashboard.route.js";
import categoriesRouter from "../services/categories/routes/categories.route.js";
import healthRouter from "../services/health/health.route.js";
const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/cvs", cvsRouter);
router.use("/analyses", analysesRouter);
router.use("/dashboard", dashboardRouter);
router.use("/categories", categoriesRouter);
router.use("/health", healthRouter);
export default router;
