
import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // milliseconds, 0 = infinite
}

export interface UIStore {
  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Global loading state
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;

  // Modal states
  modals: Record<string, boolean>;
  openModal: (name: string) => void;
  closeModal: (name: string) => void;
  toggleModal: (name: string) => void;

  // Global error state
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

let toastCounter = 0;

export const useUIStore = create<UIStore>((set) => ({
  // Initial toast state
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${toastCounter++}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto-remove toast after duration
    if (toast.duration !== 0) {
      const duration = toast.duration || 3000;
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  clearToasts: () => {
    set({ toasts: [] });
  },

  // Loading state
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),

  // Modal state
  modals: {},
  openModal: (name) => {
    set((state) => ({
      modals: { ...state.modals, [name]: true },
    }));
  },
  closeModal: (name) => {
    set((state) => ({
      modals: { ...state.modals, [name]: false },
    }));
  },
  toggleModal: (name) => {
    set((state) => ({
      modals: { ...state.modals, [name]: !state.modals[name] },
    }));
  },

  // Error state
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
