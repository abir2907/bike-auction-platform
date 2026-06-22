import { z } from 'zod';

export const createInquirySchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid(),
    name: z.string().min(2).max(80),
    email: z.string().email(),
    phone: z.string().regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number'),
    message: z.string().min(5).max(2000),
  }),
});
