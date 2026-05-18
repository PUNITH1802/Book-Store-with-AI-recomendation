import { api } from '@/lib/axios';
import type { User, ApiResponse } from '@/types';

interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data).then((r) => r.data.data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data).then((r) => r.data.data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};
