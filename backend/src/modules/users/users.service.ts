import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { hashPassword, verifyPassword } from '../../utils/password';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  avatarUrl: true,
  emailVerified: true,
  createdAt: true,
} as const;

export async function updateProfile(
  userId: string,
  data: { name?: string; phone?: string; avatarUrl?: string },
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone === '' ? null : data.phone,
      avatarUrl: data.avatarUrl === '' ? null : data.avatarUrl,
    },
    select: publicUserSelect,
  });
}

export async function changePassword(userId: string, current: string, next: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  if (!(await verifyPassword(current, user.passwordHash))) {
    throw ApiError.badRequest('Current password is incorrect');
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(next) } }),
    // Force re-auth on other devices after a password change.
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function listSavedVehicles(userId: string) {
  const saved = await prisma.savedVehicle.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      vehicle: {
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          auction: true,
        },
      },
    },
  });
  return saved.map((s) => s.vehicle);
}

export async function toggleSavedVehicle(userId: string, vehicleId: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw ApiError.notFound('Vehicle not found');

  const existing = await prisma.savedVehicle.findUnique({
    where: { userId_vehicleId: { userId, vehicleId } },
  });
  if (existing) {
    await prisma.savedVehicle.delete({ where: { id: existing.id } });
    return { saved: false };
  }
  await prisma.savedVehicle.create({ data: { userId, vehicleId } });
  return { saved: true };
}

export async function listMyInquiries(userId: string) {
  return prisma.inquiry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      vehicle: { select: { id: true, slug: true, title: true } },
    },
  });
}

export async function listMyBids(userId: string) {
  const bids = await prisma.bid.findMany({
    where: { bidderId: userId },
    orderBy: { createdAt: 'desc' },
    distinct: ['auctionId'],
    include: {
      auction: {
        include: {
          vehicle: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } },
        },
      },
    },
  });
  return bids.map((b) => ({
    auction: b.auction,
    myLastBid: b.amount,
    isWinning: b.auction.currentPrice.equals(b.amount),
    isWinner: b.auction.winnerId === userId,
  }));
}
