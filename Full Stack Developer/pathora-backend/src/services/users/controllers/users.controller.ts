
import type { Request, Response, NextFunction } from "express";
import { response } from "../../../utils/response.js";
import type { User } from "../repositories/users.repository.js";
import type { UpdateProfileDto } from "../validators/users.schema.js";

interface GetProfileUseCase {
  execute(userId: string): Promise<User>;
}
interface UpdateProfileUseCase {
  execute(userId: string, data: UpdateProfileDto): Promise<User>;
}
interface UsersControllerDeps {
  getProfileUseCase: GetProfileUseCase;
  updateProfileUseCase: UpdateProfileUseCase;
}

export function createUsersController({
  getProfileUseCase,
  updateProfileUseCase,
}: UsersControllerDeps) {

  async function getMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await getProfileUseCase.execute(req.user!.id);
      res.status(200).json(response.success(user));
    } catch (err) {
      next(err);
    }
  }

  async function updateMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await updateProfileUseCase.execute(
        req.user!.id,
        req.body as UpdateProfileDto,
      );
      res.status(200).json(response.success(user));
    } catch (err) {
      next(err);
    }
  }
  return { getMe, updateMe };
}
