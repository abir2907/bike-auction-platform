import { emitToAuction } from './io';
import { bidsCounter } from '../middleware/metrics';
import type { PlaceBidResult } from '../modules/auctions/auctions.service';

/**
 * Single place that turns a bid result into the real-time events every
 * connected client receives. Used by BOTH the WebSocket handler and the REST
 * fallback endpoint so behaviour is identical regardless of transport.
 */
export function broadcastBid(result: PlaceBidResult): void {
  bidsCounter.inc();
  emitToAuction(result.auction.id, 'bid:new', {
    auctionId: result.auction.id,
    bid: result.bid,
    currentPrice: Number(result.auction.currentPrice),
    totalBids: result.auction.totalBids,
    endTime: result.auction.endTime,
    extended: result.extended,
  });
}

export function broadcastStatus(auctionId: string, status: string, payload: Record<string, unknown> = {}): void {
  emitToAuction(auctionId, 'auction:status', { auctionId, status, ...payload });
}
