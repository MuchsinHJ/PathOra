import { apiClient } from "./api.client.ts";
import { API_ROUTES } from "../constants/api-routes";
import { ApiResponse } from "../types/api";
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  User,
} from "../types/auth.ts";

type BackendUser = {
  id: string;
  full_name: string;
  email: string;
  profile_picture?: string | null;
  created_at: string;
  updated_at?: string;
};

const mapUser = (user: BackendUser): User => ({
  id: user.id,
  name: user.full_name,
  email: user.email,
  profile_picture: user.profile_picture ?? null,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

export const authService = {
  /**
   * Register pengguna baru
   * POST /auth/register
   */
  async register(payload: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<
      ApiResponse<{ user: BackendUser; token?: string } | BackendUser>
    >(API_ROUTES.AUTH.REGISTER, {
      full_name: payload.name,
      email: payload.email,
      password: payload.password,
    });

    const data = response.data.data;
    if (!data) {
      throw new Error("Register response tidak valid");
    }

    if ("user" in data) {
      return {
        token: data.token ?? "",
        user: mapUser(data.user),
      };
    }

    return {
      token: "",
      user: mapUser(data),
    };
  },

  /**
   * Login pengguna
   * POST /auth/login
   */
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<
      ApiResponse<{ token: string; user: BackendUser }>
    >(API_ROUTES.AUTH.LOGIN, payload);
    const data = response.data.data;
    if (!data) {
      throw new Error("Login response tidak valid");
    }
    return {
      token: data.token,
      user: mapUser(data.user),
    };
  },

  /**
   * Logout (client-side hanya, token dihapus dari localStorage)
   */
  logout(): void {
    localStorage.removeItem("token");
  },
};
