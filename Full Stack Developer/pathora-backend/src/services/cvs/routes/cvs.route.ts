
import { Router } from "express";
import { auth } from "../../../middlewares/auth.js";
import { validate } from "../../../middlewares/validate.js";
import { strictLimiter } from "../../../middlewares/rate-limit.js";
import { uploadCvFile } from "../../../middlewares/upload.js";
import { cvsRepository } from "../repositories/cvs.repository.js";
import { analysesRepository } from "../../analyses/repositories/analyses.repository.js";
import { CvIdParamSchema } from "../validators/cvs.schema.js";
import { createUploadCvTextUseCase } from "../use-cases/upload-cv-text.use-case.js";
import { createUploadCvFileUseCase } from "../use-cases/upload-cv-file.use-case.js";
import { createDeleteCvUseCase } from "../use-cases/delete-cv.use-case.js";
import { createListCvsUseCase } from "../use-cases/list-cvs.use-case.js";
import { createGetCvUseCase } from "../use-cases/get-cv.use-case.js";
import { createCvsController } from "../controllers/cvs.controller.js";
import { createTriggerAnalysisUseCase } from "../../analyses/use-cases/trigger-analysis.use-case.js";
import { createGetLatestByCvUseCase } from "../../analyses/use-cases/get-latest-by-cv.use-case.js";
import { createGetAnalysisUseCase } from "../../analyses/use-cases/get-analysis.use-case.js";
import { createListAnalysesUseCase } from "../../analyses/use-cases/list-analyses.use-case.js";
import { createAnalysesController } from "../../analyses/controllers/analyses.controller.js";
import { createAiGateway } from "../../ai-gateway/ai-gateway.factory.js";

const aiGateway = createAiGateway();

const { upload, list, getOne, remove } = createCvsController({
  uploadCvTextUseCase: createUploadCvTextUseCase({ cvsRepo: cvsRepository }),
  uploadCvFileUseCase: createUploadCvFileUseCase({ cvsRepo: cvsRepository }),
  deleteCvUseCase: createDeleteCvUseCase({ cvsRepo: cvsRepository }),
  listCvsUseCase: createListCvsUseCase({ cvsRepo: cvsRepository }),
  getCvUseCase: createGetCvUseCase({ cvsRepo: cvsRepository }),
});

const { trigger, getLatestByCv } = createAnalysesController({
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
router.post("/", auth, uploadCvFile, upload);
router.get("/", auth, list);
router.get("/:cvId", auth, validate(CvIdParamSchema, "params"), getOne);
router.delete("/:cvId", auth, validate(CvIdParamSchema, "params"), remove);
router.post(
  "/:cvId/analyze",
  auth,
  strictLimiter,
  validate(CvIdParamSchema, "params"),
  trigger,
);
router.get(
  "/:cvId/analysis",
  auth,
  validate(CvIdParamSchema, "params"),
  getLatestByCv,
);
export default router;
