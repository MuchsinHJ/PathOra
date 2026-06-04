
export interface SuccessResponse<T> {
  data: T;
  error: null;
  meta: Record<string, unknown>;
}
export interface ErrorResponse {
  data: null;
  error: { message: string; details?: unknown };
  meta: Record<string, unknown>;
}

export const response = {

  success<T>(data: T, meta: Record<string, unknown> = {}): SuccessResponse<T> {
    return { data, error: null, meta };
  },

  error(message: string, details?: unknown): ErrorResponse {
    return {
      data: null,
      error: details !== undefined ? { message, details } : { message },
      meta: {},
    };
  },
};
