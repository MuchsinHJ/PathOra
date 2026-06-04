/**
 * useCategories Hook
 * Sesuai SDD §13 - Hooks Design
 * Menangani fetch daftar kategori karir
 */

import { useState, useEffect } from "react";
import { categoryService } from "../services/category.service";
import { Category } from "../types/category";
import { parseApiError } from "../utils/error";

export interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

export function useCategories() {
  const [state, setState] = useState<CategoriesState>({
    categories: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await categoryService.getCategories();
        setState((prev) => ({
          ...prev,
          categories: result,
          isLoading: false,
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: parseApiError(error),
          isLoading: false,
        }));
      }
    };

    fetchCategories();
  }, []);

  return {
    ...state,
  };
}
