import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { buildPageMeta } from '../../utils/pagination';
import { logger } from '../../config/logger';

const auctionInclude = {
  vehicle: {
    include: {
      images: { orderBy: { sortOrder: 'asc' as const } },
      seller: { select: { id: true, name: true, avatarUrl: true } },
    },
  },
  winner: { select: { id: true, name: true } },
} satisfies Prisma.AuctionInclude;

export async function list(params: {
  status?: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'SETTLED' | 'CANCELLED';
  page: number;
  limit: number;
}) {
  const where: Prisma.AuctionWhereInput = params.status
    ? { status: params.status }
    : { status: { in: ['SCHEDULED', 'LIVE'] } };
  const [items, total] = await Promise.all([
    prisma.auction.findMany({
      where,
      include: auctionInclude,
      orderBy: [{ status: 'asc' }, { endTime: 'asc' }],
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
    prisma.auction.count({ where }),
  ]);
  return { items, meta: buildPageMeta(total, params.page, params.limit) };
}

export async function getById(id: string) {
  const auction = await prisma.auction.findUnique({ where: { id }, include: auctionInclude });
  if (!auction) throw ApiError.notFound('Auction not found');
  return auction;
}

export async function getBids(auctionId: string, limit = 25) {
  return prisma.bid.findMany({
    where: { auctionId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { bidder: { select: { id: true, name: true } } },
  });
}

/** The minimum amount a new bid must meet/exceed for this auction. */
export function minimumNextBid(a: {
  totalBids: number;
  currentPrice: Prisma.Decimal;
  startingPrice: Prisma.Decimal;
  bidIncrement: Prisma.Decimal;
}): number {
  if (a.totalBids === 0) return Number(a.startingPrice);
  return Number(a.currentPrice) + Number(a.bidIncrement);
}

export interface PlaceBidResult {
  auction: Awaited<ReturnType<typeof getById>>;
  bid: { id: string; amount: number; bidderId: string; bidderName: string; createdAt: Date };
  extended: boolean;
}

/**
 * Server-authoritative bid placement.
 *
 * Correctness under concurrency is guaranteed by a `SELECT ... FOR UPDATE`
 * row lock on the auction inside a transaction: two simultaneous bids are
 * serialised by Postgres, so exactly one can win at any given price. We also:
 *   - reject bids on non-LIVE / out-of-window auctions,
 *   - forbid the seller bidding on their own vehicle,
 *   - enforce the minimum increment,
 *   - apply anti-snipe (extend the end time if a bid lands in the dying seconds).
 */
export async function placeBid(
  auctionId: string,
  bidderId: string,
  amount: number,
): Promise<PlaceBidResult> {
  const now = new Date();

  const updatedId = await prisma.$transaction(async (tx) => {
    // Acquire the lock; the row stays locked until this transaction commits.
    await tx.$queryRaw`SELECT id FROM auctions WHERE id = ${auctionId}::uuid FOR UPDATE`;

    const auction = await tx.auction.findUnique({
      where: { id: auctionId },
      include: { vehicle: { select: { sellerId: true } } },
    });
    if (!auction) throw ApiError.notFound('Auction not found');
    if (auction.status !== 'LIVE') throw ApiError.badRequest('This auction is not currently live');
    if (now < auction.startTime || now >= auction.endTime) {
      throw ApiError.badRequest('This auction is not accepting bids right now');
    }
    if (auction.vehicle.sellerId === bidderId) {
      throw ApiError.forbidden('You cannot bid on your own vehicle');
    }
    if (auction.winnerId === bidderId) {
      throw ApiError.badRequest('You are already the highest bidder');
    }

    const minNext = minimumNextBid(auction);
    if (amount < minNext) {
      throw ApiError.badRequest(`Your bid must be at least ₹${minNext.toLocaleString('en-IN')}`);
    }

    await tx.bid.create({ data: { auctionId, bidderId, amount } });

    // Anti-snipe: a bid in the final seconds pushes the finish line out.
    const msLeft = auction.endTime.getTime() - now.getTime();
    const extend = auction.antiSnipeSeconds > 0 && msLeft <= auction.antiSnipeSeconds * 1000;
    const newEndTime = extend
      ? new Date(now.getTime() + auction.antiSnipeSeconds * 1000)
      : auction.endTime;

    await tx.auction.update({
      where: { id: auctionId },
      data: {
        currentPrice: amount,
        totalBids: { increment: 1 },
        winnerId: bidderId, // current leader
        reserveMet: auction.reservePrice ? amount >= Number(auction.reservePrice) : true,
        endTime: newEndTime,
      },
    });

    return { extended: extend };
  });

  const [auction, bidder] = await Promise.all([
    getById(auctionId),
    prisma.user.findUnique({ where: { id: bidderId }, select: { name: true } }),
  ]);

  const latest = await prisma.bid.findFirst({
    where: { auctionId, bidderId, amount },
    orderBy: { createdAt: 'desc' },
  });

  return {
    auction,
    bid: {
      id: latest!.id,
      amount,
      bidderId,
      bidderName: bidder?.name ?? 'Bidder',
      createdAt: latest!.createdAt,
    },
    extended: updatedId.extended,
  };
}

// ── Admin / lifecycle ────────────────────────────────────────────────────────

export async function createAuction(input: {
  vehicleId: string;
  startingPrice: number;
  reservePrice?: number;
  bidIncrement: number;
  startTime: Date;
  endTime: Date;
  antiSnipeSeconds: number;
}) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: input.vehicleId },
    include: { auction: true },
  });
  if (!vehicle) throw ApiError.notFound('Vehicle not found');
  if (vehicle.auction) throw ApiError.conflict('This vehicle already has an auction');

  return prisma.$transaction(async (tx) => {
    await tx.vehicle.update({
      where: { id: input.vehicleId },
      data: { listingType: 'AUCTION', status: 'ACTIVE' },
    });
    return tx.auction.create({
      data: {
        vehicleId: input.vehicleId,
        startingPrice: input.startingPrice,
        reservePrice: input.reservePrice,
        bidIncrement: input.bidIncrement,
        currentPrice: input.startingPrice,
        startTime: input.startTime,
        endTime: input.endTime,
        antiSnipeSeconds: input.antiSnipeSeconds,
        status: input.startTime <= new Date() ? 'LIVE' : 'SCHEDULED',
      },
      include: auctionInclude,
    });
  });
}

export async function cancelAuction(id: string) {
  const auction = await prisma.auction.findUnique({ where: { id } });
  if (!auction) throw ApiError.notFound('Auction not found');
  if (auction.status === 'SETTLED') throw ApiError.badRequest('Settled auctions cannot be cancelled');
  return prisma.auction.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: auctionInclude,
  });
}

/**
 * Settle an ended auction: confirm the winner if the reserve was met and mark
 * the vehicle SOLD; otherwise leave it unsold. Returns the settled auction.
 */
export async function settleAuction(id: string) {
  return prisma.$transaction(async (tx) => {
    const auction = await tx.auction.findUnique({ where: { id } });
    if (!auction || auction.status === 'SETTLED') return null;

    const reserveMet = auction.reservePrice
      ? Number(auction.currentPrice) >= Number(auction.reservePrice)
      : auction.totalBids > 0;
    const hasWinner = auction.totalBids > 0 && reserveMet;

    const settled = await tx.auction.update({
      where: { id },
      data: {
        status: 'SETTLED',
        reserveMet,
        winnerId: hasWinner ? auction.winnerId : null,
      },
      include: auctionInclude,
    });

    await tx.vehicle.update({
      where: { id: auction.vehicleId },
      data: { status: hasWinner ? 'SOLD' : 'ARCHIVED' },
    });

    logger.info({ auctionId: id, hasWinner, reserveMet }, 'Auction settled');
    return settled;
  });
}
