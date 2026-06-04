import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ENV } from "../constants/environment";
import { ApiError } from "../types/api";

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Menyisipkan JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Normalisasi Error handling secara global (Sesuai SDD NFR-021)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // SDD mensyaratkan kembalian data berupa ApiResponse<T>
    return response;
  },
  (error: AxiosError) => {
    let normalizedError: ApiError = {
      code: "UNKNOWN_ERROR",
      message: "Terjadi kesalahan tak terduga. Silakan coba lagi.",
    };

    if (error.response) {
      const data = error.response.data as any;
      const details = data?.error?.details;
      normalizedError = {
        code:
          data?.error?.code ||
          data?.error?.type ||
          details?.type ||
          `HTTP_${error.response.status}`,
        message:
          data?.error?.message ||
          data?.message ||
          "Terjadi kesalahan pada server.",
        fields: data?.error?.fields,
        status: error.response.status,
        details,
      };

      if (error.response.status === 401) {
        const requestUrl = error.config?.url ?? "";
        const isAuthRequest =
          requestUrl.includes("/auth/login") ||
          requestUrl.includes("/auth/register");

        if (!isAuthRequest) {
          // useAuthStore.getState().logout();
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
    } else if (error.request) {
      // Ketika request tidak ada respon (misal jaringan down atau Timeout 504 / ECONNABORTED)
      if (error.code === "ECONNABORTED") {
        normalizedError.code = "TIMEOUT";
        normalizedError.message =
          "Proses memakan waktu terlalu lama. Silakan coba lagi.";
      } else {
        normalizedError.code = "NETWORK_ERROR";
        normalizedError.message =
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      }
    }

    // Return promise reject dengan error normal agar dapat ditangkap secara terstruktur di level Service/Hook
    return Promise.reject(normalizedError);
  },
);
