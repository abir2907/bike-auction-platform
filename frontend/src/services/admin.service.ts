import { api } from '@/lib/api';
import type { Faq, Inquiry, PageMeta, Testimonial, User, Vehicle } from '@/types';

export interface AdminDashboard {
  metrics: {
    totalUsers: number;
    totalVehicles: number;
    activeVehicles: number;
    soldVehicles: number;
    totalInquiries: number;
    newInquiries: number;
    liveAuctions: number;
    settledAuctions: number;
    grossMerchandiseValue: number;
  };
  recentInquiries: Inquiry[];
  recentUsers: User[];
}

export const adminService = {
  async dashboard() {
    const { data } = await api.get<{ data: AdminDashboard }>('/admin/dashboard');
    return data.data;
  },

  async users(params: { q?: string; role?: string; page?: number }) {
    const { data } = await api.get<{ data: (User & { _count?: Record<string, number> })[]; meta: PageMeta }>(
      '/admin/users',
      { params },
    );
    return { items: data.data, meta: data.meta };
  },
  async updateUser(id: string, body: Partial<Pick<User, 'name' | 'phone' | 'role'>> & { isActive?: boolean }) {
    const { data } = await api.patch<{ data: User }>(`/admin/users/${id}`, body);
    return data.data;
  },
  async deleteUser(id: string) {
    await api.delete(`/admin/users/${id}`);
  },

  async vehicles(params: { q?: string; status?: string; page?: number }) {
    const { data } = await api.get<{ data: Vehicle[]; meta: PageMeta }>('/admin/vehicles', { params });
    return { items: data.data, meta: data.meta };
  },
  async moderateVehicle(id: string, body: { status?: string; featured?: boolean }) {
    const { data } = await api.patch<{ data: Vehicle }>(`/admin/vehicles/${id}`, body);
    return data.data;
  },
  async deleteVehicle(id: string) {
    await api.delete(`/admin/vehicles/${id}`);
  },

  async inquiries(params: { status?: string; page?: number }) {
    const { data } = await api.get<{ data: Inquiry[]; meta: PageMeta }>('/admin/inquiries', { params });
    return { items: data.data, meta: data.meta };
  },
  async updateInquiry(id: string, status: string) {
    const { data } = await api.patch<{ data: Inquiry }>(`/admin/inquiries/${id}`, { status });
    return data.data;
  },
  async deleteInquiry(id: string) {
    await api.delete(`/admin/inquiries/${id}`);
  },

  // CMS
  async faqs() {
    const { data } = await api.get<{ data: Faq[] }>('/admin/faqs');
    return data.data;
  },
  async createFaq(body: Partial<Faq>) {
    const { data } = await api.post<{ data: Faq }>('/admin/faqs', body);
    return data.data;
  },
  async updateFaq(id: string, body: Partial<Faq>) {
    const { data } = await api.patch<{ data: Faq }>(`/admin/faqs/${id}`, body);
    return data.data;
  },
  async deleteFaq(id: string) {
    await api.delete(`/admin/faqs/${id}`);
  },
  async testimonials() {
    const { data } = await api.get<{ data: Testimonial[] }>('/admin/testimonials');
    return data.data;
  },
  async createTestimonial(body: Partial<Testimonial>) {
    const { data } = await api.post<{ data: Testimonial }>('/admin/testimonials', body);
    return data.data;
  },
  async updateTestimonial(id: string, body: Partial<Testimonial>) {
    const { data } = await api.patch<{ data: Testimonial }>(`/admin/testimonials/${id}`, body);
    return data.data;
  },
  async deleteTestimonial(id: string) {
    await api.delete(`/admin/testimonials/${id}`);
  },
};
