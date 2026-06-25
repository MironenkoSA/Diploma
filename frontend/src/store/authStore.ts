// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { useCartStore } from './cartStore';
import { authApi } from '../api';

function clearAuthTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

interface AuthState {
  user: User | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; consentGiven: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          const { user, accessToken, refreshToken } = data.data!;
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          set({ user, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.register(formData);
          const { user, accessToken, refreshToken } = data.data!;
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          set({ user, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await authApi.logout(refreshToken).catch(() => {});
        }
        clearAuthTokens();
        try { useCartStore.getState().clearCart(); } catch {}
        set({ user: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await authApi.me();
          set({ user: data.data });
        } catch (err: any) {
          // Сбрасываем сессию ТОЛЬКО при 401 (токен недействителен)
          // При сетевых ошибках, 500 и т.д. — оставляем пользователя залогиненным
          if (err?.response?.status === 401) {
            clearAuthTokens();
            set({ user: null });
          }
        }
      },

      updateUser: (partial) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...partial } });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
