import { create } from "zustand";
import { User } from "../types/auth.ts";

/**
 * Global Auth State Management dengan Zustand (SDD UI-020)
 * Menyimpan user info, token, dan auth status untuk seluruh aplikasi
 */

interface AuthStore {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    logout: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    // Initial state
    user: null,
    token: localStorage.getItem("token"),
    isAuthenticated: !!localStorage.getItem("token"),
    isLoading: false,
    error: null,

    // Actions
    setUser: (user) => set({ user }),
    setToken: (token) => {
        if (token) {
            localStorage.setItem("token", token);
            set({ token, isAuthenticated: true });
        } else {
            localStorage.removeItem("token");
            set({ token: null, isAuthenticated: false, user: null });
        }
    },
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    logout: () => {
        localStorage.removeItem("token");
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
        });
    },
    clearError: () => set({ error: null }),
}));