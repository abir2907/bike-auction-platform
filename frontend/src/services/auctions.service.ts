import { api } from '@/lib/api';
import type { Auction, Bid, PageMeta } from '@/types';

export const auctionsService = {
  async list(params: { status?: string; page?: number; limit?: number } = {}) {
    const { data } = await api.get<{ data: Auction[]; meta: PageMeta }>('/auctions', { params });
    return { items: data.data, meta: data.meta };
  },
  async getById(id: string) {
    const { data } = await api.get<{ data: Auction }>(`/auctions/${id}`);
    return data.data;
  },
  async bids(id: string) {
    const { data } = await api.get<{ data: Bid[] }>(`/auctions/${id}/bids`);
    return data.data;
  },
  async placeBid(id: string, amount: number) {
    const { data } = await api.post<{ data: { currentPrice: number; totalBids: number; endTime: string } }>(
      `/auctions/${id}/bids`,
      { amount },
    );
    return data.data;
  },
  // Admin
  async create(input: {
    vehicleId: string;
    startingPrice: number;
    reservePrice?: number;
    bidIncrement: number;
    startTime: string;
    endTime: string;
    antiSnipeSeconds: number;
  }) {
    const { data } = await api.post<{ data: Auction }>('/auctions', input);
    return data.data;
  },
  async cancel(id: string) {
    const { data } = await api.post<{ data: Auction }>(`/auctions/${id}/cancel`);
    return data.data;
  },
};
