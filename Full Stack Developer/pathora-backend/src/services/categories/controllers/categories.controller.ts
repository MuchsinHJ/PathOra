
import type { Request, Response, NextFunction } from "express";
import { response } from "../../../utils/response.js";
import type { Category } from "../repositories/categories.repository.js";

interface CategoriesRepo {
  findAll(): Promise<Category[]>;
}
interface CategoriesControllerDeps {
  categoriesRepo: CategoriesRepo;
}

export function createCategoriesController({
  categoriesRepo,
}: CategoriesControllerDeps) {
  let cache: Category[] | null = null;

  async function getAll(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!cache) {
        cache = await categoriesRepo.findAll();
      }
      res.status(200).json(response.success(cache));
    } catch (err) {
      next(err);
    }
  }
  return { getAll };
}
