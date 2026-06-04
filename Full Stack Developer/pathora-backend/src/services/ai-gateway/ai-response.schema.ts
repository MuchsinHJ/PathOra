
import { z } from "zod";

const PredictionSchema = z.object({
  category: z.string().min(1),
  confidence: z.number().min(0).max(1),
});
const MatchedSkillSchema = z.object({
  skill: z.string().min(1),
  similarity: z.number().min(0).max(1),
});
const ExtractedSkillSchema = z.object({
  category: z.string().min(1),
  matched_skills: z.array(MatchedSkillSchema),
  missing_skills: z.array(z.string()),
});
const CareerRecommendationSchema = z.object({
  category: z.string().min(1),
  match_score: z.number().min(0).max(1),
});

export const AiResponseSchema = z.object({
  cv_id: z.string().min(1),
  analyzed_at: z.string().min(1),
  predicted_category: z.string().min(1),
  confidence: z.number().min(0).max(1),

  top_5_predictions: z.array(PredictionSchema).min(1).max(5),

  extracted_skills: z.array(ExtractedSkillSchema),

  career_recommendations: z.array(CareerRecommendationSchema),

  description_career_recommendations: z.string().nullable(),
});

export type AiAnalysisResult = z.infer<typeof AiResponseSchema>;
