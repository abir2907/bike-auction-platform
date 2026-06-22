import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { buildPageMeta } from '../../utils/pagination';

// ── Dashboard analytics ───────────────────────────────────────────────────────

export async function dashboard() {
  const [
    totalUsers,
    totalVehicles,
    activeVehicles,
    soldVehicles,
    totalInquiries,
    newInquiries,
    liveAuctions,
    settledAuctions,
    revenueAgg,
    recentInquiries,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: 'ACTIVE' } }),
    prisma.vehicle.count({ where: { status: 'SOLD' } }),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: 'NEW' } }),
    prisma.auction.count({ where: { status: 'LIVE' } }),
    prisma.auction.count({ where: { status: 'SETTLED', winnerId: { not: null } } }),
    // GMV proxy: sum of winning prices on settled auctions with a winner.
    prisma.auction.aggregate({
      where: { status: 'SETTLED', winnerId: { not: null } },
      _sum: { currentPrice: true },
    }),
    prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { vehicle: { select: { title: true, slug: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  return {
    metrics: {
      totalUsers,
      totalVehicles,
      activeVehicles,
      soldVehicles,
      totalInquiries,
      newInquiries,
      liveAuctions,
      settledAuctions,
      grossMerchandiseValue: Number(revenueAgg._sum.currentPrice ?? 0),
    },
    recentInquiries,
    recentUsers,
  };
}

// ── Users ──────────────────────────────────────────────────────────────────────

export async function listUsers(p: { q?: string; role?: 'USER' | 'ADMIN'; page: number; limit: number }) {
  const where: Prisma.UserWhereInput = {};
  if (p.role) where.role = p.role;
  if (p.q) {
    where.OR = [
      { name: { contains: p.q, mode: 'insensitive' } },
      { email: { contains: p.q, mode: 'insensitive' } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (p.page - 1) * p.limit,
      take: p.limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { listings: true, bids: true, inquiries: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);
  return { items, meta: buildPageMeta(total, p.page, p.limit) };
}

export async function updateUser(
  id: string,
  actingAdminId: string,
  data: { name?: string; phone?: string; role?: 'USER' | 'ADMIN'; isActive?: boolean },
) {
  if (id === actingAdminId && (data.role === 'USER' || data.isActive === false)) {
    throw ApiError.badRequest('You cannot demote or deactivate your own admin account');
  }
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true },
  });
}

export async function deleteUser(id: string, actingAdminId: string) {
  if (id === actingAdminId) throw ApiError.badRequest('You cannot delete your own account');
  await prisma.user.delete({ where: { id } });
}

// ── Vehicles moderation ──────────────────────────────────────────────────────

export async function listVehicles(p: {
  q?: string;
  status?: Prisma.VehicleWhereInput['status'];
  page: number;
  limit: number;
}) {
  const where: Prisma.VehicleWhereInput = {};
  if (p.status) where.status = p.status;
  if (p.q) {
    where.OR = [
      { title: { contains: p.q, mode: 'insensitive' } },
      { brand: { contains: p.q, mode: 'insensitive' } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (p.page - 1) * p.limit,
      take: p.limit,
      include: {
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
        seller: { select: { id: true, name: true, email: true } },
        auction: { select: { id: true, status: true } },
      },
    }),
    prisma.vehicle.count({ where }),
  ]);
  return { items, meta: buildPageMeta(total, p.page, p.limit) };
}

export async function moderateVehicle(id: string, data: { status?: Prisma.VehicleUpdateInput['status']; featured?: boolean }) {
  return prisma.vehicle.update({ where: { id }, data });
}

export async function deleteVehicle(id: string) {
  await prisma.vehicle.delete({ where: { id } });
}

// ── Inquiries ────────────────────────────────────────────────────────────────

export async function listInquiries(p: { status?: 'NEW' | 'CONTACTED' | 'CLOSED'; page: number; limit: number }) {
  const where: Prisma.InquiryWhereInput = p.status ? { status: p.status } : {};
  const [items, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (p.page - 1) * p.limit,
      take: p.limit,
      include: { vehicle: { select: { id: true, title: true, slug: true } } },
    }),
    prisma.inquiry.count({ where }),
  ]);
  return { items, meta: buildPageMeta(total, p.page, p.limit) };
}

export async function updateInquiry(id: string, status: 'NEW' | 'CONTACTED' | 'CLOSED') {
  return prisma.inquiry.update({ where: { id }, data: { status } });
}

export async function deleteInquiry(id: string) {
  await prisma.inquiry.delete({ where: { id } });
}

// ── CMS: FAQs ────────────────────────────────────────────────────────────────

export const listFaqs = () => prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } });
export const createFaq = (data: Prisma.FaqCreateInput) => prisma.faq.create({ data });
export const updateFaq = (id: string, data: Prisma.FaqUpdateInput) =>
  prisma.faq.update({ where: { id }, data });
export const deleteFaq = (id: string) => prisma.faq.delete({ where: { id } }).then(() => undefined);

// ── CMS: Testimonials ──────────────────────────────────────────────────────────

export const listTestimonials = () => prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } });
export const createTestimonial = (data: Prisma.TestimonialCreateInput) =>
  prisma.testimonial.create({ data });
export const updateTestimonial = (id: string, data: Prisma.TestimonialUpdateInput) =>
  prisma.testimonial.update({ where: { id }, data });
export const deleteTestimonial = (id: string) =>
  prisma.testimonial.delete({ where: { id } }).then(() => undefined);

// ── CMS: Site content (key/value) ───────────────────────────────────────────────

export const listSiteContent = () => prisma.siteContent.findMany();
export const upsertSiteContent = (key: string, value: Prisma.InputJsonValue) =>
  prisma.siteContent.upsert({ where: { key }, create: { key, value }, update: { value } });
