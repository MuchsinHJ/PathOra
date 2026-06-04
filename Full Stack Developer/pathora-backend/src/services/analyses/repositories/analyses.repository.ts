import { query } from "../../../config/database.js";
import type { PaginationParams } from "../../../utils/pagination.js";
import type { AiAnalysisResult } from "../../ai-gateway/ai-response.schema.js";

export type AnalysisStatus = "pending" | "success" | "failed";
export interface AnalysisSummary {
  id: string;
  cv_id: string;
  user_id: string;
  status: AnalysisStatus;
  predicted_category: string | null;
  confidence: number | null;
  analyzed_at: Date | null;
  created_at: Date;
}
export interface Analysis extends AnalysisSummary {
  result: AiAnalysisResult | null;
}
export interface CreateAnalysisDto {
  cv_id: string;
  user_id: string;
  status: AnalysisStatus;
}
export interface UpdateAnalysisDto {
  status?: AnalysisStatus;
  predicted_category?: string;
  confidence?: number;
  result?: AiAnalysisResult;
  analyzed_at?: Date;
}

export const analysesRepository = {
  async create(data: CreateAnalysisDto): Promise<AnalysisSummary> {
    const result = await query<AnalysisSummary>(
      `INSERT INTO analyses (cv_id, user_id, status)
       VALUES ($1, $2, $3)
       RETURNING id, cv_id, user_id, status, predicted_category, confidence, analyzed_at, created_at`,
      [data.cv_id, data.user_id, data.status],
    );
    return result.rows[0]!;
  },

  async update(
    id: string,
    data: Partial<UpdateAnalysisDto>,
  ): Promise<AnalysisSummary> {
    const fields = Object.keys(data) as (keyof UpdateAnalysisDto)[];
    const setClauses = fields.map((f, i) => `${f} = $${i + 1}`);
    const values = fields.map((f) => {
      const val = data[f];
      if (f === "result") return JSON.stringify(val);
      return val;
    });
    values.push(id);
    const result = await query<AnalysisSummary>(
      `UPDATE analyses
       SET ${setClauses.join(", ")}
       WHERE id = $${values.length}
       RETURNING id, cv_id, user_id, status, predicted_category, confidence, analyzed_at, created_at`,
      values,
    );
    return result.rows[0]!;
  },

  async findById(id: string): Promise<Analysis | null> {
    const result = await query<Analysis>(
      `SELECT id, cv_id, user_id, status, predicted_category, confidence,
              result, analyzed_at, created_at
       FROM analyses
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  },

  async findByUser(
    userId: string,
    pagination: PaginationParams,
  ): Promise<AnalysisSummary[]> {
    const result = await query<AnalysisSummary>(
      `SELECT id, cv_id, user_id, status, predicted_category, confidence, analyzed_at, created_at
       FROM analyses
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pagination.limit, pagination.offset],
    );
    return result.rows;
  },

  async findLatestByCvId(cvId: string): Promise<Analysis | null> {
    const result = await query<Analysis>(
      `SELECT id, cv_id, user_id, status, predicted_category, confidence,
              result, analyzed_at, created_at
       FROM analyses
       WHERE cv_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [cvId],
    );
    return result.rows[0] ?? null;
  },
};
