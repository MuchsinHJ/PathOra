/**
 * API Routes Constants
 * Sesuai SDD & SRS - API Contract
 * Centralized API endpoint paths
 */

export const API_ROUTES = {
  // Auth
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
  },

  // Users
  USERS: {
    ME: "/users/me",
    UPDATE_PROFILE: "/users/me",
  },

  // CV Management
  CVS: {
    BASE: "/cvs",
    GET_CV: (id: string) => `/cvs/${id}`,
    UPLOAD: "/cvs",
    ANALYZE: (id: string) => `/cvs/${id}/analyze`,
    LATEST_ANALYSIS: (id: string) => `/cvs/${id}/analysis`,
    LIST: "/cvs",
    DELETE: (id: string) => `/cvs/${id}`,
  },

  // Analysis & Results
  ANALYSES: {
    BASE: "/analyses",
    GET: (id: string) => `/analyses/${id}`,
    LIST: "/analyses",
  },

  // Categories
  CATEGORIES: {
    BASE: "/categories",
    LIST: "/categories",
  },

  // Dashboard
  DASHBOARD: {
    ME: "/dashboard/me",
  },

  // Health Check
  HEALTH: "/health",
} as const;
