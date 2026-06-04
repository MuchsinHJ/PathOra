
import { query } from "../../../config/database.js";
import type { PaginationParams } from "../../../utils/pagination.js";

export interface Cv {
  id: string;
  user_id: string;
  source_type: "text" | "file";
  created_at: Date;
}
export interface CvFull extends Cv {
  raw_text: string | null;
  file_name: string | null;
  file_mime: string | null;
  file_data: Buffer | null;
}
export interface CreateCvTextDto {
  user_id: string;
  source_type: "text";
  raw_text: string;
}
export interface CreateCvFileDto {
  user_id: string;
  source_type: "file";
  file_name: string;
  file_mime: string;
  file_data: Buffer;
}
export type CreateCvDto = CreateCvTextDto | CreateCvFileDto;

export const cvsRepository = {

  async create(data: CreateCvDto): Promise<Cv> {
    if (data.source_type === "text") {
      const result = await query<Cv>(
        `INSERT INTO cvs (user_id, source_type, raw_text)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, source_type, created_at`,
        [data.user_id, data.source_type, data.raw_text],
      );
      return result.rows[0]!;
    } else {
      const result = await query<Cv>(
        `INSERT INTO cvs (user_id, source_type, file_name, file_mime, file_data)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, source_type, created_at`,
        [
          data.user_id,
          data.source_type,
          data.file_name,
          data.file_mime,
          data.file_data,
        ],
      );
      return result.rows[0]!;
    }
  },

  async findById(id: string): Promise<CvFull | null> {
    const result = await query<CvFull>(
      `SELECT id, user_id, source_type, raw_text, file_name, file_mime, file_data, created_at
       FROM cvs
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  },

  async findByUser(
    userId: string,
    pagination: PaginationParams,
  ): Promise<Cv[]> {
    const result = await query<Cv>(
      `SELECT id, user_id, source_type, created_at
       FROM cvs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pagination.limit, pagination.offset],
    );
    return result.rows;
  },

  async delete(id: string): Promise<void> {
    await query(`DELETE FROM cvs WHERE id = $1`, [id]);
  },
};
