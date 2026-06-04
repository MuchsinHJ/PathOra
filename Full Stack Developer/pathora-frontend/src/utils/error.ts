/**
 * Error Handling Utilities
 * Sesuai SDD §20 - Utility Design & SRS §3.7 ERROR-004 & SEC-006
 */

import axios from "axios";
import { ApiError } from "../types/api";

export const isNetworkError = (error: unknown): boolean =>
  axios.isAxiosError(error) && !error.response;

/**
 * Parse API error menjadi user-friendly message
 * Sesuai SDD error handling design
 */
export function parseApiError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const apiError = error as ApiError;
    const code = apiError.code?.toLowerCase();
    if (
      code === "timeout" ||
      apiError.status === 504 ||
      apiError.message.toLowerCase().includes("tidak merespons")
    ) {
      return apiError.message || "Layanan AI tidak merespons. Coba lagi.";
    }
    if (
      code === "invalid_response" ||
      apiError.message.toLowerCase().includes("bukan json")
    ) {
      return apiError.message || "Respons AI tidak valid. Coba analisis ulang.";
    }
    if (code === "upstream_error" || apiError.status === 502) {
      return apiError.message || "Layanan AI sedang bermasalah. Coba lagi.";
    }
    if (typeof apiError.message === "string" && apiError.message.trim()) {
      return apiError.message;
    }
  }

  if (isNetworkError(error))
    return "Koneksi gagal. Periksa jaringan Anda lalu coba lagi.";

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as any;
    const apiMsg = data?.error?.message || data?.message;

    switch (status) {
      case 400:
        return apiMsg ?? "Request tidak valid.";
      case 401:
        return apiMsg ?? "Sesi Anda berakhir. Silakan login kembali.";
      case 403:
        return "Akses ditolak.";
      case 409:
        return apiMsg ?? "Data sudah terdaftar.";
      case 404:
        return apiMsg ?? "Data tidak ditemukan.";
      case 422:
        return apiMsg ?? "Input tidak valid.";
      case 500:
        return "Terjadi kesalahan pada server. Coba lagi nanti.";
      case 502:
        return "Layanan analisis sedang tidak tersedia. Coba lagi.";
      case 503:
        return "Server sedang dalam perbaikan. Coba lagi nanti.";
      case 504:
        return "Analisis memakan waktu terlalu lama. Coba lagi.";
      default:
        return apiMsg ?? "Terjadi kesalahan. Silakan coba lagi.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan tak terduga.";
}

/**
 * Check apakah error adalah 401 Unauthorized
 */
export function isUnauthorizedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

/**
 * Check apakah error adalah timeout
 */
export function isTimeoutError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.code === "ECONNABORTED";
}

/**
 * Check apakah error adalah validation error
 */
export function isValidationError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 422;
}

/**
 * Get validation field errors dari 422 response
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError(error) && error.response?.status === 422) {
    const data = error.response?.data as any;
    return data?.error?.fields ?? {};
  }
  return {};
}

/**
 * Get error code untuk telemetry/logging
 */
export function getErrorCode(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;
    return data?.error?.code ?? `HTTP_${error.response?.status}`;
  }
  return "UNKNOWN_ERROR";
}
