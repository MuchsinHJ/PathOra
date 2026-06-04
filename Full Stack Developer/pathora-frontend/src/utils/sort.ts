/**
 * Sort Utilities
 * Sesuai SDD §20 - Utility Design
 * Helper functions untuk sorting data
 */

import { TopPrediction, CareerRecommendation, Analysis } from "../types/analysis";

/**
 * Sort predictions by confidence (descending)
 */
export function sortPredictionsByConfidence(
  predictions: TopPrediction[],
  order: "asc" | "desc" = "desc"
): TopPrediction[] {
  return [...predictions].sort((a, b) => {
    const diff = a.confidence - b.confidence;
    return order === "desc" ? -diff : diff;
  });
}

/**
 * Sort predictions by match score (descending)
 */
export function sortPredictionsByScore(
  predictions: TopPrediction[],
  order: "asc" | "desc" = "desc"
): TopPrediction[] {
  return [...predictions].sort((a, b) => {
    const diff = a.score - b.score;
    return order === "desc" ? -diff : diff;
  });
}

/**
 * Sort recommendations by match_score (descending)
 */
export function sortRecommendationsByScore(
  recommendations: CareerRecommendation[],
  order: "asc" | "desc" = "desc"
): CareerRecommendation[] {
  return [...recommendations].sort((a, b) => {
    const diff = a.match_score - b.match_score;
    return order === "desc" ? -diff : diff;
  });
}

/**
 * Sort analyses by date (descending = newest first)
 */
export function sortAnalysesByDate(
  analyses: Analysis[],
  order: "asc" | "desc" = "desc"
): Analysis[] {
  return [...analyses].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return order === "desc" ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Sort analyses by confidence (descending)
 */
export function sortAnalysesByConfidence(
  analyses: Analysis[],
  order: "asc" | "desc" = "desc"
): Analysis[] {
  return [...analyses].sort((a, b) => {
    const diff = a.confidence - b.confidence;
    return order === "desc" ? -diff : diff;
  });
}

/**
 * Sort string array alphabetically
 */
export function sortSkillsAlphabetically(
  skills: string[],
  order: "asc" | "desc" = "asc"
): string[] {
  return [...skills].sort((a, b) => {
    const result = a.localeCompare(b);
    return order === "asc" ? result : -result;
  });
}
