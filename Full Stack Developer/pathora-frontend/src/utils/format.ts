import { date } from "zod/v4/mini";

export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}


export function formatConfidenceScore(score: number): string {
  return formatPercentage(score, 0);
}


export function formatMatchScore(score: number): string {
  return formatPercentage(score, 0);
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCategoryName(category: string): string {
  // Contoh: "software_engineer" -> "Software Engineer"
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatSkillList(skills: string[]): string {
  if (skills.length === 0) return "Tidak ada keterampilan yang cocok";
  if (skills.length === 1) return skills[0];
  return skills.slice(0, -1).join(", ") + " dan " + skills[skills.length - 1];
}