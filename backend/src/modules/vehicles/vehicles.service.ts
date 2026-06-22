import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { buildPageMeta } from '../../utils/pagination';
import { slugify } from '../../utils/slug';

const sellerSelect = { id: true, name: true, avatarUrl: true, createdAt: true } as const;

const vehicleInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  seller: { select: sellerSelect },
  auction: true,
} satisfies Prisma.VehicleInclude;

export interface ListFilters {
  q?: string;
  brand?: string;
  fuelType?: 'PETROL' | 'ELECTRIC' | 'HYBRID';
  listingType?: 'SALE' | 'AUCTION';
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  sort: (typeof import('./vehicles.validation').SORT_OPTIONS)[number];
  page: number;
  limit: number;
}

function buildWhere(f: ListFilters): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = { status: 'ACTIVE' };
  if (f.brand) where.brand = { equals: f.brand, mode: 'insensitive' };
  if (f.fuelType) where.fuelType = f.fuelType;
  if (f.listingType) where.listingType = f.listingType;
  if (f.city) where.city = { equals: f.city, mode: 'insensitive' };
  if (f.minPrice != null || f.maxPrice != null) {
    where.price = {};
    if (f.minPrice != null) where.price.gte = f.minPrice;
    if (f.maxPrice != null) where.price.lte = f.maxPrice;
  }
  if (f.minYear != null || f.maxYear != null) {
    where.year = {};
    if (f.minYear != null) where.year.gte = f.minYear;
    if (f.maxYear != null) where.year.lte = f.maxYear;
  }
  if (f.q) {
    where.OR = [
      { title: { contains: f.q, mode: 'insensitive' } },
      { brand: { contains: f.q, mode: 'insensitive' } },
      { model: { contains: f.q, mode: 'insensitive' } },
      { description: { contains: f.q, mode: 'insensitive' } },
    ];
  }
  return where;
}

function buildOrderBy(sort: ListFilters['sort']): Prisma.VehicleOrderByWithRelationInput[] {
  switch (sort) {
    case 'price_asc':
      return [{ price: 'asc' }];
    case 'price_desc':
      return [{ price: 'desc' }];
    case 'year_desc':
      return [{ year: 'desc' }];
    case 'km_asc':
      return [{ kmDriven: 'asc' }];
    case 'popular':
      return [{ viewCount: 'desc' }];
    case 'newest':
    default:
      return [{ featured: 'desc' }, { createdAt: 'desc' }];
  }
}

export async function listPublic(filters: ListFilters) {
  const where = buildWhere(filters);
  const [items, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      include: vehicleInclude,
      orderBy: buildOrderBy(filters.sort),
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.vehicle.count({ where }),
  ]);
  return { items, meta: buildPageMeta(total, filters.page, filters.limit) };
}

export async function getFeatured(limit = 6) {
  return prisma.vehicle.findMany({
    where: { status: 'ACTIVE', featured: true },
    include: vehicleInclude,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getBySlug(slug: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { slug }, include: vehicleInclude });
  if (!vehicle || vehicle.status !== 'ACTIVE') throw ApiError.notFound('Vehicle not found');
  // Best-effort view counter (don't block the response).
  prisma.vehicle.update({ where: { id: vehicle.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
  return vehicle;
}

export async function getSimilar(vehicleId: string, limit = 4) {
  const base = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!base) return [];
  return prisma.vehicle.findMany({
    where: {
      status: 'ACTIVE',
      id: { not: vehicleId },
      OR: [{ brand: base.brand }, { fuelType: base.fuelType }],
    },
    include: vehicleInclude,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function createListing(
  sellerId: string,
  data: VehicleWriteInput,
) {
  const { images, ...rest } = data;
  return prisma.vehicle.create({
    data: {
      ...rest,
      slug: slugify(rest.title),
      sellerId,
      // Auto-published for SALE listings to keep the marketplace usable.
      // AUCTION listings stay PENDING until an admin schedules the auction.
      status: rest.listingType === 'AUCTION' ? 'PENDING' : 'ACTIVE',
      images: {
        create: normaliseImages(images),
      },
    },
    include: vehicleInclude,
  });
}

export async function listMine(sellerId: string) {
  return prisma.vehicle.findMany({
    where: { sellerId },
    include: vehicleInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOwnedOrFail(id: string, userId: string, isAdmin: boolean) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw ApiError.notFound('Vehicle not found');
  if (!isAdmin && vehicle.sellerId !== userId) {
    throw ApiError.forbidden('You can only modify your own listings');
  }
  return vehicle;
}

export async function updateListing(
  id: string,
  userId: string,
  isAdmin: boolean,
  data: Partial<VehicleWriteInput>,
) {
  await getOwnedOrFail(id, userId, isAdmin);
  const { images, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    if (images) {
      await tx.vehicleImage.deleteMany({ where: { vehicleId: id } });
      await tx.vehicleImage.createMany({
        data: normaliseImages(images).map((img) => ({ ...img, vehicleId: id })),
      });
    }
    return tx.vehicle.update({ where: { id }, data: rest, include: vehicleInclude });
  });
}

export async function deleteListing(id: string, userId: string, isAdmin: boolean) {
  await getOwnedOrFail(id, userId, isAdmin);
  await prisma.vehicle.delete({ where: { id } });
}

// ── helpers ──
export interface VehicleWriteInput {
  title: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  fuelType: 'PETROL' | 'ELECTRIC' | 'HYBRID';
  transmission: 'MANUAL' | 'AUTOMATIC';
  kmDriven: number;
  ownerCount: number;
  engineCapacityCc?: number;
  color?: string;
  registrationState?: string;
  city: string;
  description: string;
  price: number;
  listingType: 'SALE' | 'AUCTION';
  images: { url: string; isPrimary?: boolean; sortOrder?: number }[];
}

function normaliseImages(images: VehicleWriteInput['images']) {
  return images.map((img, i) => ({
    url: img.url,
    isPrimary: img.isPrimary ?? i === 0,
    sortOrder: img.sortOrder ?? i,
  }));
}
