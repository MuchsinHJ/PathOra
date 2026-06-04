
import { TopPrediction, CareerRecommendation, Analysis } from "../types/analysis";

/**
 * Filter top predictions dengan confidence threshold
 * Sesuai SRS VAL-008: "Filter ambang confidence > 0.05"
 */
export function filterTopPredictions(
  predictions: TopPrediction[],
  minConfidence: number = 0.05
): TopPrediction[] {
  return predictions.filter((p) => p.confidence > minConfidence);
}

/**
 * Filter career recommendations dengan match_score threshold
 * Sesuai SRS VAL-008: "Filter match_score > 0.3"
 */
export function filterCareerRecommendations(
  recommendations: CareerRecommendation[],
  minMatchScore: number = 0.3
): CareerRecommendation[] {
  return recommendations.filter((r) => r.match_score > minMatchScore);
}

/**
 * Get top N predictions
 */
export function getTopNPredictions(
  predictions: TopPrediction[],
  n: number = 5
): TopPrediction[] {
  return predictions.slice(0, n);
}

/**
 * Get top N career recommendations
 */
export function getTopNRecommendations(
  recommendations: CareerRecommendation[],
  n: number = 5
): CareerRecommendation[] {
  return recommendations.slice(0, n);
}

/**
 * Filter analyses by status
 */
export function filterAnalysesByStatus(
  analyses: Analysis[],
  status: "success" | "failed" | "pending"
): Analysis[] {
  return analyses.filter((a) => a.status === status);
}

/**
 * Get successful analyses only
 */
export function getSuccessfulAnalyses(analyses: Analysis[]): Analysis[] {
  return filterAnalysesByStatus(analyses, "success");
}

/**
 * Search skills dalam array
 */
export function searchSkills(skills: string[], query: string): string[] {
  const lowerQuery = query.toLowerCase();
  return skills.filter((skill) =>
    skill.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Combine dan deduplicate skills
 */
export function deduplicateSkills(skills: string[]): string[] {
  return Array.from(new Set(skills));
}
