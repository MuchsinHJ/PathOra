
import type { Request, Response, NextFunction } from "express";
import { response } from "../../../utils/response.js";
import { parsePagination } from "../../../utils/pagination.js";
import type { UploadCvTextDto } from "../validators/cvs.schema.js";

interface UploadCvTextUseCase {
  execute(input: { userId: string; raw_text: string }): Promise<unknown>;
}
interface UploadCvFileUseCase {
  execute(input: {
    userId: string;
    buffer: Buffer;
    mimeType: string;
    fileName: string;
  }): Promise<unknown>;
}
interface DeleteCvUseCase {
  execute(cvId: string, userId: string): Promise<void>;
}
interface ListCvsUseCase {
  execute(
    userId: string,
    pagination: { limit: number; offset: number },
  ): Promise<{ cvs: unknown[]; meta: unknown }>;
}
interface GetCvUseCase {
  execute(cvId: string, userId: string): Promise<unknown>;
}
interface CvsControllerDeps {
  uploadCvTextUseCase: UploadCvTextUseCase;
  uploadCvFileUseCase: UploadCvFileUseCase;
  deleteCvUseCase: DeleteCvUseCase;
  listCvsUseCase: ListCvsUseCase;
  getCvUseCase: GetCvUseCase;
}

export function createCvsController({
  uploadCvTextUseCase,
  uploadCvFileUseCase,
  deleteCvUseCase,
  listCvsUseCase,
  getCvUseCase,
}: CvsControllerDeps) {

  async function upload(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      let cv: unknown;
      if (req.file) {
        cv = await uploadCvFileUseCase.execute({
          userId,
          buffer: req.file.buffer,
          mimeType: req.file.mimetype,
          fileName: req.file.originalname,
        });
      } else {
        const body = req.body as UploadCvTextDto;
        cv = await uploadCvTextUseCase.execute({
          userId,
          raw_text: body.raw_text,
        });
      }
      res.status(201).json(response.success(cv));
    } catch (err) {
      next(err);
    }
  }

  async function list(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const pagination = parsePagination(req.query as Record<string, unknown>);
      const result = await listCvsUseCase.execute(userId, pagination);
      res
        .status(200)
        .json(
          response.success(result.cvs, result.meta as Record<string, unknown>),
        );
    } catch (err) {
      next(err);
    }
  }

  async function getOne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { cvId } = req.params as { cvId: string };
      const cv = await getCvUseCase.execute(cvId, req.user!.id);
      res.status(200).json(response.success(cv));
    } catch (err) {
      next(err);
    }
  }

  async function remove(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { cvId } = req.params as { cvId: string };
      await deleteCvUseCase.execute(cvId, req.user!.id);
      res.status(200).json(response.success(null));
    } catch (err) {
      next(err);
    }
  }
  return { upload, list, getOne, remove };
}
