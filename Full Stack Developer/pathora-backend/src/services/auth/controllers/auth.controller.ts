
import type { Request, Response, NextFunction } from "express";
import { response } from "../../../utils/response.js";
import type { User } from "../repositories/auth.repository.js";
import type { RegisterDto, LoginDto } from "../validators/auth.schema.js";

interface RegisterUseCase {
  execute(dto: RegisterDto): Promise<User>;
}
interface LoginUseCase {
  execute(dto: LoginDto): Promise<{ token: string; user: User }>;
}
interface AuthControllerDeps {
  registerUseCase: RegisterUseCase;
  loginUseCase: LoginUseCase;
}

export function createAuthController({
  registerUseCase,
  loginUseCase,
}: AuthControllerDeps) {

  async function register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await registerUseCase.execute(req.body as RegisterDto);
      res.status(201).json(response.success(user));
    } catch (err) {
      next(err);
    }
  }

  async function login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await loginUseCase.execute(req.body as LoginDto);
      res.status(200).json(response.success(result));
    } catch (err) {
      next(err);
    }
  }
  return { register, login };
}
