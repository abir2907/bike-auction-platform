import { z } from 'zod';

// Strong-enough password: min 8 chars with at least one letter and one number.
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters') // bcrypt truncates beyond 72 bytes
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is too short').max(80),
    email: z.string().email('Enter a valid email'),
    phone: z
      .string()
      .regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number')
      .optional(),
    password,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().email() }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    password,
  }),
});
