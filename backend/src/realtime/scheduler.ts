import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { activeAuctionsGauge } from '../middleware/metrics';
import { broadcastStatus } from './auctionEvents';
import * as auctionService from '../modules/auctions/auctions.service';

/**
 * Auction lifecycle driver.
 *
 * A lightweight in-process ticker that, every AUCTION_TICK_MS:
 *   1. Promotes SCHEDULED auctions whose startTime has passed → LIVE.
 *   2. Ends LIVE auctions whose endTime has passed → settles winner/reserve.
 *   3. Updates the "live auctions" gauge for monitoring.
 *
 * Each transition emits a real-time `auction:status` event so open auction
 * pages update instantly. A guard flag prevents overlapping ticks.
 *
 * NOTE: For multi-instance deployments this should move to a single leader
 * (e.g. a dedicated worker, or a Postgres advisory lock / Redis lock) so the
 * lifecycle runs exactly once — see ARCHITECTURE.md "Scaling".
 */
let running = false;
let timer: NodeJS.Timeout | null = null;

async function tick(): Promise<void> {
  if (running) return;
  running = true;
  const now = new Date();
  try {
    // 1. Start due auctions.
    const starting = await prisma.auction.findMany({
      where: { status: 'SCHEDULED', startTime: { lte: now } },
      select: { id: true },
    });
    for (const a of starting) {
      await prisma.auction.update({ where: { id: a.id }, data: { status: 'LIVE' } });
      broadcastStatus(a.id, 'LIVE');
      logger.info({ auctionId: a.id }, 'Auction went LIVE');
    }

    // 2. End + settle finished auctions.
    const ending = await prisma.auction.findMany({
      where: { status: 'LIVE', endTime: { lte: now } },
      select: { id: true },
    });
    for (const a of ending) {
      await prisma.auction.update({ where: { id: a.id }, data: { status: 'ENDED' } });
      const settled = await auctionService.settleAuction(a.id);
      broadcastStatus(a.id, 'SETTLED', {
        winnerId: settled?.winnerId ?? null,
        finalPrice: settled ? Number(settled.currentPrice) : null,
        reserveMet: settled?.reserveMet ?? false,
      });
    }

    // 3. Monitoring gauge.
    const live = await prisma.auction.count({ where: { status: 'LIVE' } });
    activeAuctionsGauge.set(live);
  } catch (err) {
    logger.error({ err }, 'Auction scheduler tick failed');
  } finally {
    running = false;
  }
}

export function startAuctionScheduler(): void {
  if (timer) return;
  timer = setInterval(() => void tick(), env.AUCTION_TICK_MS);
  logger.info({ everyMs: env.AUCTION_TICK_MS }, '✅ Auction scheduler started');
  void tick();
}

export function stopAuctionScheduler(): void {
  if (timer) clearInterval(timer);
  timer = null;
}
