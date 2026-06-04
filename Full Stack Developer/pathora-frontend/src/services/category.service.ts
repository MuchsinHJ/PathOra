import { apiClient } from "./api.client";
import { API_ROUTES } from "../constants/api-routes";
import { ApiResponse } from "../types/api";
import { Category } from "../types/category";

export const categoryService = {
  /**
   * Get daftar semua kategori karir
   * GET /categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>(
        API_ROUTES.CATEGORIES.LIST,
      );
      return response.data.data ?? [];
    } catch (error: any) {
      throw {
        code:
          error.response?.data?.error?.code ||
          error.code ||
          "GET_CATEGORIES_ERROR",
        message:
          error.response?.data?.error?.message ||
          error.message ||
          "Gagal mengambil daftar kategori",
      };
    }
  },
};
