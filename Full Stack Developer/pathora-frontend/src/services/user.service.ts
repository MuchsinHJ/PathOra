import { apiClient } from "../services/api.client";
import { API_ROUTES } from "../constants/api-routes";
import { ApiResponse } from "../types/api";
import { User, UpdateProfileRequest } from "../types/auth";

type BackendUser = {
  id: string;
  full_name: string;
  email: string;
  profile_picture?: string | null;
  created_at: string;
  updated_at?: string;
};

type BackendUserPayload = BackendUser | { user: BackendUser };

const getUserFromPayload = (payload: BackendUserPayload): BackendUser =>
  "user" in payload ? payload.user : payload;

const mapUser = (user: BackendUser): User => ({
  id: user.id,
  name: user.full_name,
  email: user.email,
  profile_picture: user.profile_picture ?? null,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

export const userService = {
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<BackendUserPayload>>(
        API_ROUTES.USERS.ME,
      );
      if (!response.data.data) {
        throw new Error("Profile response tidak valid");
      }
      return mapUser(getUserFromPayload(response.data.data));
    } catch (error: any) {
      throw {
        code:
          error.response?.data?.error?.code ||
          error.code ||
          "GET_PROFILE_ERROR",
        message:
          error.response?.data?.error?.message ||
          error.message ||
          "Gagal mengambil profil pengguna",
      };
    }
  },

  async updateProfile(payload: UpdateProfileRequest): Promise<User> {
    try {
      const response = await apiClient.patch<ApiResponse<BackendUserPayload>>(
        API_ROUTES.USERS.UPDATE_PROFILE,
        {
          full_name: payload.name,
          email: payload.email,
        },
      );
      if (!response.data.data) {
        throw new Error("Update profile response tidak valid");
      }
      return mapUser(getUserFromPayload(response.data.data));
    } catch (error: any) {
      throw {
        code:
          error.response?.data?.error?.code ||
          error.code ||
          "UPDATE_PROFILE_ERROR",
        message:
          error.response?.data?.error?.message ||
          error.message ||
          "Gagal memperbarui profil pengguna",
      };
    }
  },

  async uploadProfilePhoto(formData: FormData): Promise<User> {
    const response = await apiClient.post("/users/profile/photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },
};
