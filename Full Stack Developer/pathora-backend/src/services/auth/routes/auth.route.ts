
import { Router } from "express";
import { strictLimiter } from "../../../middlewares/rate-limit.js";
import { validate } from "../../../middlewares/validate.js";
import { authRepository } from "../repositories/auth.repository.js";
import { RegisterSchema, LoginSchema } from "../validators/auth.schema.js";
import { createRegisterUseCase } from "../use-cases/register.use-case.js";
import { createLoginUseCase } from "../use-cases/login.use-case.js";
import { createAuthController } from "../controllers/auth.controller.js";
import { passwordManager } from "../../../security/password-manager.js";
import { tokenManager } from "../../../security/token-manager.js";

const registerUseCase = createRegisterUseCase({
  authRepo: authRepository,
  passwordManager,
});
const loginUseCase = createLoginUseCase({
  authRepo: authRepository,
  passwordManager,
  tokenManager,
});
const { register, login } = createAuthController({
  registerUseCase,
  loginUseCase,
});

const router = Router();
router.post(
  "/register",
  strictLimiter,
  validate(RegisterSchema, "body"),
  register,
);
router.post("/login", strictLimiter, validate(LoginSchema, "body"), login);
export default router;
