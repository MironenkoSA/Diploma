// src/api/client.ts
// ИСПРАВЛЕНО: BUG-09 (localStorage.clear() заменён на точечное удаление токенов)

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';

const SESSION_ID = (() => {
  const key = 'vs_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) { id = uuidv4(); sessionStorage.setItem(key, id); }
  return id;
})();

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json', 'X-Session-Id': SESSION_ID },
  timeout: 15_000,
  withCredentials: false,
});

// FIX BUG-09: Удаляем только токены, а не все данные из localStorage
function clearAuthTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

apiClient.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        clearAuthTokens();
        try {
          const { useAuthStore } = await import('../store/authStore');
          useAuthStore.setState({ user: null });
        } catch {}
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );
        const { accessToken, refreshToken: newRefresh } = data.data;
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefresh);
        processQueue(null, accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        // Обновляем user в store без редиректа
        try {
          const { useAuthStore } = await import('../store/authStore');
          await useAuthStore.getState().fetchMe();
        } catch {}
        return apiClient(original);
      } catch (err) {
        processQueue(err, null);
        clearAuthTokens();
        // Сбрасываем user в store без жёсткого редиректа
        try {
          const { useAuthStore } = await import('../store/authStore');
          useAuthStore.setState({ user: null });
        } catch {}
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
