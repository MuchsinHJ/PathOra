
import { Router } from "express";
import { categoriesRepository } from "../repositories/categories.repository.js";
import { createCategoriesController } from "../controllers/categories.controller.js";

const { getAll } = createCategoriesController({
  categoriesRepo: categoriesRepository,
});

const router = Router();
router.get("/", getAll);
export default router;
