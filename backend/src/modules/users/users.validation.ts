import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    phone: z
      .string()
      .regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number')
      .optional()
      .or(z.literal('')),
    avatarUrl: z.string().url().optional().or(z.literal('')),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72)
      .regex(/[A-Za-z]/, 'Password must contain a letter')
      .regex(/[0-9]/, 'Password must contain a number'),
  }),
});

export const savedParamSchema = z.object({
  params: z.object({ vehicleId: z.string().uuid() }),
});
