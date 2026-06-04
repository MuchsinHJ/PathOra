
export interface PaginationParams {
  limit: number;
  offset: number;
}
export interface PaginationMeta {
  limit: number;
  offset: number;
}
export interface PaginationResult {
  limit: number;
  offset: number;
  meta: PaginationMeta;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const DEFAULT_OFFSET = 0;

function parseIntOrDefault(value: unknown, fallback: number): number {
  const parsed = parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function parsePagination(
  query: Record<string, unknown>,
): PaginationResult {
  const rawLimit = parseIntOrDefault(query["limit"], DEFAULT_LIMIT);
  const rawOffset = parseIntOrDefault(query["offset"], DEFAULT_OFFSET);
  const limit = clamp(rawLimit, 1, MAX_LIMIT);
  const offset = clamp(rawOffset, 0, Number.MAX_SAFE_INTEGER);
  return {
    limit,
    offset,
    meta: { limit, offset },
  };
}
