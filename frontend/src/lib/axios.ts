import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(original))
          .catch(Promise.reject.bind(Promise));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post<{ data: { accessToken: string } }>('/auth/refresh');
        useAuthStore.getState().setAccessToken(res.data.data.accessToken);
        failedQueue.forEach(({ resolve }) => resolve(null));
        failedQueue = [];
        return api(original);
      } catch {
        failedQueue.forEach(({ reject }) => reject(error));
        failedQueue = [];
        useAuthStore.getState().logout();
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
