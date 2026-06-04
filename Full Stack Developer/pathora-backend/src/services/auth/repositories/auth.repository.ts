
import { query } from "../../../config/database.js";

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: Date;
}
export interface UserWithHash extends User {
  password_hash: string;
}
export interface CreateUserDto {
  email: string;
  full_name: string;
  password_hash: string;
}

export const authRepository = {

  async findByEmail(email: string): Promise<UserWithHash | null> {
    const result = await query<UserWithHash>(
      `SELECT id, email, password_hash, full_name, created_at
       FROM users
       WHERE email = $1`,
      [email],
    );
    return result.rows[0] ?? null;
  },

  async createUser(data: CreateUserDto): Promise<User> {
    const result = await query<User>(
      `INSERT INTO users (email, full_name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, created_at`,
      [data.email, data.full_name, data.password_hash],
    );
    return result.rows[0];
  },
};
