import { z } from 'zod';

export const listAuctionsSchema = z.object({
  query: z.object({
    status: z.enum(['SCHEDULED', 'LIVE', 'ENDED', 'SETTLED', 'CANCELLED']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
  }),
});

export const auctionIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export const placeBidSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ amount: z.number().positive().max(100000000) }),
});

export const createAuctionSchema = z.object({
  body: z
    .object({
      vehicleId: z.string().uuid(),
      startingPrice: z.number().positive(),
      reservePrice: z.number().positive().optional(),
      // Optional "direct buy" price — when set, buyers can purchase instantly
      // at this amount instead of bidding. Omitted/undefined = not available.
      buyNowPrice: z.number().positive().optional(),
      bidIncrement: z.number().positive().default(500),
      startTime: z.coerce.date(),
      endTime: z.coerce.date(),
      antiSnipeSeconds: z.number().int().min(0).max(600).default(30),
    })
    .refine((d) => d.endTime > d.startTime, {
      message: 'endTime must be after startTime',
      path: ['endTime'],
    })
    .refine((d) => !d.reservePrice || d.reservePrice >= d.startingPrice, {
      message: 'reservePrice must be >= startingPrice',
      path: ['reservePrice'],
    })
    .refine((d) => !d.buyNowPrice || d.buyNowPrice > d.startingPrice, {
      message: 'Direct buy price must be greater than the starting price',
      path: ['buyNowPrice'],
    })
    .refine((d) => !d.buyNowPrice || !d.reservePrice || d.buyNowPrice >= d.reservePrice, {
      message: 'Direct buy price must be at least the reserve price',
      path: ['buyNowPrice'],
    }),
});
