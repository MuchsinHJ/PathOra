/**
 * Category Types
 * Sesuai SDD §10 & SRS §3 - Career Category Reference
 */

export interface Category {
  code: string; // e.g., "INFORMATION-TECHNOLOGY"
  display_name: string;
  description: string;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
}
