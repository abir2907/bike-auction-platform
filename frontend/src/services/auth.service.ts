import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthPayload {
  user: User;
  accessToken: string;
}

export const authService = {
  async register(input: { name: string; email: string; phone?: string; password: string }) {
    const { data } = await api.post<{ data: AuthPayload }>('/auth/register', input);
    return data.data;
  },
  async login(input: { email: string; password: string }) {
    const { data } = await api.post<{ data: AuthPayload }>('/auth/login', input);
    return data.data;
  },
  async refresh() {
    const { data } = await api.post<{ data: AuthPayload }>('/auth/refresh');
    return data.data;
  },
  async logout() {
    await api.post('/auth/logout');
  },
  async me() {
    const { data } = await api.get<{ data: User }>('/auth/me');
    return data.data;
  },
  async forgotPassword(email: string) {
    const { data } = await api.post<{ data: { message: string } }>('/auth/forgot-password', { email });
    return data.data;
  },
  async resetPassword(token: string, password: string) {
    const { data } = await api.post<{ data: { message: string } }>('/auth/reset-password', { token, password });
    return data.data;
  },
};
