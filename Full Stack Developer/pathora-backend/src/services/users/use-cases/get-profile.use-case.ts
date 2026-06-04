
import { NotFoundError } from "../../../exceptions/not-found-error.js";
import type { User } from "../repositories/users.repository.js";

interface UsersRepo {
  findById(id: string): Promise<User | null>;
}
interface GetProfileDeps {
  usersRepo: UsersRepo;
}

export function createGetProfileUseCase({ usersRepo }: GetProfileDeps) {
  return {

    async execute(userId: string): Promise<User> {
      const user = await usersRepo.findById(userId);
      if (!user) {
        throw new NotFoundError("Pengguna tidak ditemukan");
      }
      return user;
    },
  };
}
