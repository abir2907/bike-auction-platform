import { api } from '@/lib/api';
import type { Faq, Inquiry, PlatformStats, Testimonial, User, Vehicle } from '@/types';

export const cmsService = {
  async faqs() {
    const { data } = await api.get<{ data: Faq[] }>('/cms/faqs');
    return data.data;
  },
  async testimonials() {
    const { data } = await api.get<{ data: Testimonial[] }>('/cms/testimonials');
    return data.data;
  },
  async stats() {
    const { data } = await api.get<{ data: PlatformStats }>('/cms/stats');
    return data.data;
  },
  async content() {
    const { data } = await api.get<{ data: Record<string, unknown> }>('/cms/content');
    return data.data;
  },
};

export const inquiriesService = {
  async create(input: { vehicleId: string; name: string; email: string; phone: string; message: string }) {
    const { data } = await api.post<{ data: { message: string } }>('/inquiries', input);
    return data.data;
  },
};

export const usersService = {
  async updateProfile(input: { name?: string; phone?: string; avatarUrl?: string }) {
    const { data } = await api.patch<{ data: User }>('/users/me', input);
    return data.data;
  },
  async changePassword(input: { currentPassword: string; newPassword: string }) {
    const { data } = await api.post<{ data: { message: string } }>('/users/me/change-password', input);
    return data.data;
  },
  async saved() {
    const { data } = await api.get<{ data: Vehicle[] }>('/users/me/saved');
    return data.data;
  },
  async toggleSaved(vehicleId: string) {
    const { data } = await api.post<{ data: { saved: boolean } }>(`/users/me/saved/${vehicleId}`);
    return data.data;
  },
  async inquiries() {
    const { data } = await api.get<{ data: Inquiry[] }>('/users/me/inquiries');
    return data.data;
  },
  async bids() {
    const { data } = await api.get<{ data: unknown[] }>('/users/me/bids');
    return data.data;
  },
};
