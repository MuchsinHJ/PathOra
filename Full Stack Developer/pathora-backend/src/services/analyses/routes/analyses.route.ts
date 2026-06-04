
import { Router } from "express";
import { auth } from "../../../middlewares/auth.js";
import { validate } from "../../../middlewares/validate.js";
import { analysesRepository } from "../repositories/analyses.repository.js";
import { cvsRepository } from "../../cvs/repositories/cvs.repository.js";
import { AnalysisIdParamSchema } from "../validators/analyses.schema.js";
import { createGetAnalysisUseCase } from "../use-cases/get-analysis.use-case.js";
import { createListAnalysesUseCase } from "../use-cases/list-analyses.use-case.js";
import { createGetLatestByCvUseCase } from "../use-cases/get-latest-by-cv.use-case.js";
import { createTriggerAnalysisUseCase } from "../use-cases/trigger-analysis.use-case.js";
import { createAiGateway } from "../../ai-gateway/ai-gateway.factory.js";
import { createAnalysesController } from "../controllers/analyses.controller.js";

const aiGateway = createAiGateway();
const { getOne, list } = createAnalysesController({
  triggerAnalysisUseCase: createTriggerAnalysisUseCase({
    cvsRepo: cvsRepository,
    analysesRepo: analysesRepository,
    aiGateway,
  }),
  getAnalysisUseCase: createGetAnalysisUseCase({
    analysesRepo: analysesRepository,
  }),
  getLatestByCvUseCase: createGetLatestByCvUseCase({
    cvsRepo: cvsRepository,
    analysesRepo: analysesRepository,
  }),
  listAnalysesUseCase: createListAnalysesUseCase({
    analysesRepo: analysesRepository,
  }),
});

const router = Router();
router.get("/", auth, list);
router.get(
  "/:analysisId",
  auth,
  validate(AnalysisIdParamSchema, "params"),
  getOne,
);
export default router;
