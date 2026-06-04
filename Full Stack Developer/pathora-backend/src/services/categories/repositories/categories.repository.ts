
import { query } from "../../../config/database.js";

export interface Category {
  code: string;
  display_name: string;
  description: string | null;
}

export const categoriesRepository = {

  async findAll(): Promise<Category[]> {
    const result = await query<Category>(
      `SELECT code, display_name, description
       FROM   categories
       ORDER  BY code`,
    );
    return result.rows;
  },
};
