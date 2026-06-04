
import { AuthenticationError } from "../../../exceptions/authentication-error.js";
import type { User, UserWithHash } from "../repositories/auth.repository.js";
import type { LoginDto } from "../validators/auth.schema.js";

interface AuthRepo {
  findByEmail(email: string): Promise<UserWithHash | null>;
}
interface PasswordManager {
  compare(plain: string, hash: string): Promise<boolean>;
}
interface TokenManager {
  sign(payload: { id: string; email: string }): string;
}
interface LoginDeps {
  authRepo: AuthRepo;
  passwordManager: PasswordManager;
  tokenManager: TokenManager;
}

export function createLoginUseCase({
  authRepo,
  passwordManager,
  tokenManager,
}: LoginDeps) {
  return {

    async execute({
      email,
      password,
    }: LoginDto): Promise<{ token: string; user: User }> {
      const GENERIC_ERROR = "Email atau password salah";
      const userWithHash = await authRepo.findByEmail(email);
      if (!userWithHash) {
        throw new AuthenticationError(GENERIC_ERROR);
      }
      const isValid = await passwordManager.compare(
        password,
        userWithHash.password_hash,
      );
      if (!isValid) {
        throw new AuthenticationError(GENERIC_ERROR);
      }
      const token = tokenManager.sign({
        id: userWithHash.id,
        email: userWithHash.email,
      });
      const { password_hash: _omit, ...user } = userWithHash;
      return { token, user };
    },
  };
}
