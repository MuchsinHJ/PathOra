
import { ConflictError } from "../../../exceptions/conflict-error.js";
import type { User, CreateUserDto } from "../repositories/auth.repository.js";
import type { RegisterDto } from "../validators/auth.schema.js";

interface AuthRepo {
  findByEmail(email: string): Promise<{ id: string } | null>;
  createUser(data: CreateUserDto): Promise<User>;
}
interface PasswordManager {
  hash(plain: string): Promise<string>;
}
interface RegisterDeps {
  authRepo: AuthRepo;
  passwordManager: PasswordManager;
}

export function createRegisterUseCase({
  authRepo,
  passwordManager,
}: RegisterDeps) {
  return {

    async execute({ full_name, email, password }: RegisterDto): Promise<User> {
      const existing = await authRepo.findByEmail(email);
      if (existing) {
        throw new ConflictError("Email sudah terdaftar");
      }
      const password_hash = await passwordManager.hash(password);
      const user = await authRepo.createUser({
        email,
        full_name,
        password_hash,
      });
      return user;
    },
  };
}
