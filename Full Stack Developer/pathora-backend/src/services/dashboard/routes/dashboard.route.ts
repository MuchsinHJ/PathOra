
import { Router } from "express";
import { auth } from "../../../middlewares/auth.js";
import { dashboardRepository } from "../repositories/dashboard.repository.js";
import { createGetDashboardUseCase } from "../use-cases/get-dashboard.use-case.js";
import { createDashboardController } from "../controllers/dashboard.controller.js";

const getDashboardUseCase = createGetDashboardUseCase({
  dashboardRepo: dashboardRepository,
});
const { getMyDashboard } = createDashboardController({ getDashboardUseCase });

const router = Router();
router.get("/me", auth, getMyDashboard);
export default router;
