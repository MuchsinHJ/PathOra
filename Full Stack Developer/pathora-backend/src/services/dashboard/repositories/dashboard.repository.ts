
import { query } from "../../../config/database.js";

export interface AnalysisSummary {
  id: string;
  cv_id: string;
  user_id: string;
  status: string;
  predicted_category: string | null;
  confidence: number | null;
  analyzed_at: Date | null;
  created_at: Date;
}

export const dashboardRepository = {

  async getLastAnalysis(userId: string): Promise<AnalysisSummary | null> {
    const result = await query<AnalysisSummary>(
      `SELECT id, cv_id, user_id, status, predicted_category, confidence, analyzed_at, created_at
       FROM analyses
       WHERE user_id = $1
         AND status  = 'success'
       ORDER BY analyzed_at DESC
       LIMIT 1`,
      [userId],
    );
    return result.rows[0] ?? null;
  },

  async getRecentHistory(
    userId: string,
    limit: number,
  ): Promise<AnalysisSummary[]> {
    const result = await query<AnalysisSummary>(
      `SELECT a.id, a.cv_id, a.user_id, a.status,
              a.predicted_category, a.confidence, a.analyzed_at, a.created_at
       FROM   analyses a
       JOIN   cvs      c ON a.cv_id = c.id
       WHERE  a.user_id = $1
       ORDER  BY a.created_at DESC
       LIMIT  $2`,
      [userId, limit],
    );
    return result.rows;
  },
};
