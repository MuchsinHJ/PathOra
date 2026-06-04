
import { query } from "../../../config/database.js";

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: Date;
}
export interface UpdateUserDto {
  full_name?: string;
  email?: string;
}

export const usersRepository = {

  async findById(id: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT id, email, full_name, created_at
       FROM users
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT id, email, full_name, created_at
       FROM users
       WHERE email = $1`,
      [email],
    );
    return result.rows[0] ?? null;
  },

  async update(id: string, data: Partial<UpdateUserDto>): Promise<User> {
    const fields = Object.keys(data) as (keyof UpdateUserDto)[];
    const setClauses = fields.map((field, index) => `${field} = $${index + 1}`);
    const values = fields.map((field) => data[field]);
    values.push(id);
    const idParam = `$${values.length}`;
    const result = await query<User>(
      `UPDATE users
       SET ${setClauses.join(", ")}
       WHERE id = ${idParam}
       RETURNING id, email, full_name, created_at`,
      values,
    );
    return result.rows[0];
  },
};
