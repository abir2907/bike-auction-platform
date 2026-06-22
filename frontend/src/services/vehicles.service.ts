import { api } from '@/lib/api';
import type { PageMeta, Vehicle } from '@/types';

export interface VehicleFilters {
  q?: string;
  brand?: string;
  fuelType?: string;
  listingType?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface VehicleWriteInput {
  title: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  fuelType: string;
  transmission: string;
  kmDriven: number;
  ownerCount: number;
  engineCapacityCc?: number;
  color?: string;
  registrationState?: string;
  city: string;
  description: string;
  price: number;
  listingType: string;
  images: { url: string; isPrimary?: boolean; sortOrder?: number }[];
}

export const vehiclesService = {
  async list(filters: VehicleFilters) {
    const { data } = await api.get<{ data: Vehicle[]; meta: PageMeta }>('/vehicles', { params: filters });
    return { items: data.data, meta: data.meta };
  },
  async featured() {
    const { data } = await api.get<{ data: Vehicle[] }>('/vehicles/featured');
    return data.data;
  },
  async getBySlug(slug: string) {
    const { data } = await api.get<{ data: Vehicle }>(`/vehicles/${slug}`);
    return data.data;
  },
  async similar(id: string) {
    const { data } = await api.get<{ data: Vehicle[] }>(`/vehicles/${id}/similar`);
    return data.data;
  },
  async mine() {
    const { data } = await api.get<{ data: Vehicle[] }>('/vehicles/me/listings');
    return data.data;
  },
  async create(input: VehicleWriteInput) {
    const { data } = await api.post<{ data: Vehicle }>('/vehicles', input);
    return data.data;
  },
  async update(id: string, input: Partial<VehicleWriteInput>) {
    const { data } = await api.patch<{ data: Vehicle }>(`/vehicles/${id}`, input);
    return data.data;
  },
  async remove(id: string) {
    await api.delete(`/vehicles/${id}`);
  },
};
