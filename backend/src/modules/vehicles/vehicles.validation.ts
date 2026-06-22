import { z } from 'zod';

export const SORT_OPTIONS = [
  'newest',
  'price_asc',
  'price_desc',
  'year_desc',
  'km_asc',
  'popular',
] as const;

const imageSchema = z.object({
  url: z.string().url(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const listVehiclesSchema = z.object({
  query: z.object({
    q: z.string().trim().max(100).optional(),
    brand: z.string().optional(),
    fuelType: z.enum(['PETROL', 'ELECTRIC', 'HYBRID']).optional(),
    listingType: z.enum(['SALE', 'AUCTION']).optional(),
    city: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    minYear: z.coerce.number().int().optional(),
    maxYear: z.coerce.number().int().optional(),
    sort: z.enum(SORT_OPTIONS).default('newest'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
  }),
});

const vehicleBody = z.object({
  title: z.string().min(4).max(120),
  brand: z.string().min(1).max(60),
  model: z.string().min(1).max(60),
  variant: z.string().max(60).optional(),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1),
  fuelType: z.enum(['PETROL', 'ELECTRIC', 'HYBRID']).default('PETROL'),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']).default('MANUAL'),
  kmDriven: z.number().int().min(0).max(500000),
  ownerCount: z.number().int().min(1).max(10).default(1),
  engineCapacityCc: z.number().int().min(0).max(3000).optional(),
  color: z.string().max(40).optional(),
  registrationState: z.string().max(40).optional(),
  city: z.string().min(1).max(60),
  description: z.string().min(20).max(5000),
  price: z.number().positive().max(100000000),
  listingType: z.enum(['SALE', 'AUCTION']).default('SALE'),
  images: z.array(imageSchema).min(1, 'Add at least one image').max(15),
});

export const createVehicleSchema = z.object({ body: vehicleBody });

export const updateVehicleSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: vehicleBody.partial(),
});

export const idParamSchema = z.object({ params: z.object({ id: z.string().uuid() }) });
export const slugParamSchema = z.object({ params: z.object({ slug: z.string().min(1) }) });
