
import { ConflictError } from "../../../exceptions/conflict-error.js";
import type { User } from "../repositories/users.repository.js";
import type { UpdateProfileDto } from "../validators/users.schema.js";

interface UsersRepo {
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<UpdateProfileDto>): Promise<User>;
}
interface UpdateProfileDeps {
  usersRepo: UsersRepo;
}

export function createUpdateProfileUseCase({ usersRepo }: UpdateProfileDeps) {
  return {

    async execute(userId: string, data: UpdateProfileDto): Promise<User> {
      if (data.email !== undefined) {
        const existing = await usersRepo.findByEmail(data.email);
        if (existing && existing.id !== userId) {
          throw new ConflictError("Email sudah digunakan");
        }
      }
      const user = await usersRepo.update(userId, data);
      return user;
    },
  };
}
