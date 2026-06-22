import { z } from 'zod';

const page = z.coerce.number().int().min(1).default(1);
const limit = z.coerce.number().int().min(1).max(100).default(20);

export const listUsersSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    page,
    limit,
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    phone: z.string().max(20).optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const listVehiclesSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    status: z.enum(['DRAFT', 'PENDING', 'ACTIVE', 'SOLD', 'REJECTED', 'ARCHIVED']).optional(),
    page,
    limit,
  }),
});

export const moderateVehicleSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.enum(['DRAFT', 'PENDING', 'ACTIVE', 'SOLD', 'REJECTED', 'ARCHIVED']).optional(),
    featured: z.boolean().optional(),
  }),
});

export const listInquiriesSchema = z.object({
  query: z.object({
    status: z.enum(['NEW', 'CONTACTED', 'CLOSED']).optional(),
    page,
    limit,
  }),
});

export const updateInquirySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ status: z.enum(['NEW', 'CONTACTED', 'CLOSED']) }),
});

export const idParam = z.object({ params: z.object({ id: z.string().uuid() }) });

export const faqSchema = z.object({
  body: z.object({
    question: z.string().min(5).max(300),
    answer: z.string().min(5).max(3000),
    category: z.string().max(60).optional(),
    isPublished: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
  }),
});
export const faqUpdateSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: faqSchema.shape.body.partial(),
});

export const testimonialSchema = z.object({
  body: z.object({
    authorName: z.string().min(2).max(80),
    authorTitle: z.string().max(80).optional(),
    avatarUrl: z.string().url().optional(),
    rating: z.number().int().min(1).max(5).default(5),
    content: z.string().min(5).max(1000),
    isPublished: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
  }),
});
export const testimonialUpdateSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: testimonialSchema.shape.body.partial(),
});

export const siteContentSchema = z.object({
  body: z.object({
    key: z.string().min(1).max(80),
    value: z.any(),
  }),
});
