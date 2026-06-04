/**
 * Authentication Types
 * Sesuai SDD §15 & SRS §3 - FR-001 User Registration & Login
 */

export interface User {
  id: string;
  name: string;
  email: string;

  profile_picture?: string | null;

  created_at: string;
  updated_at?: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirm?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  password?: string;
}

export interface UpdateProfileResponse {
  user: User;
}

// Legacy interface compatibility
export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthError {
  message: string;
  code: string;
}

