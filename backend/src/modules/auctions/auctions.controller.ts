import { Request, Response } from 'express';
import { created, ok } from '../../utils/response';
import { audit } from '../../utils/audit';
import { broadcastBid, broadcastStatus } from '../../realtime/auctionEvents';
import * as svc from './auctions.service';

export async function list(req: Request, res: Response) {
  const { items, meta } = await svc.list(req.query as never);
  return ok(res, items, 200, meta);
}

export async function getById(req: Request, res: Response) {
  return ok(res, await svc.getById(req.params.id));
}

export async function getBids(req: Request, res: Response) {
  return ok(res, await svc.getBids(req.params.id));
}

/** REST fallback for placing a bid (the primary path is the WebSocket). */
export async function placeBid(req: Request, res: Response) {
  const result = await svc.placeBid(req.params.id, req.user!.id, req.body.amount);
  broadcastBid(result);
  audit({
    userId: req.user!.id,
    action: 'BID_PLACE',
    entity: 'Auction',
    entityId: req.params.id,
    metadata: { amount: req.body.amount },
    ip: req.ip,
  });
  return created(res, {
    currentPrice: Number(result.auction.currentPrice),
    totalBids: result.auction.totalBids,
    endTime: result.auction.endTime,
    extended: result.extended,
  });
}

export async function create(req: Request, res: Response) {
  const auction = await svc.createAuction(req.body, {
    id: req.user!.id,
    isAdmin: req.user!.role === 'ADMIN',
  });
  audit({ userId: req.user!.id, action: 'AUCTION_CREATE', entity: 'Auction', entityId: auction.id, ip: req.ip });
  return created(res, auction);
}

/** REST fallback for direct buy (the primary path is the WebSocket). */
export async function buyNow(req: Request, res: Response) {
  const result = await svc.buyNow(req.params.id, req.user!.id);
  broadcastBid(result);
  broadcastStatus(result.auction.id, 'SETTLED', {
    winnerId: result.auction.winnerId ?? null,
    finalPrice: Number(result.auction.currentPrice),
    reserveMet: result.auction.reserveMet,
  });
  audit({
    userId: req.user!.id,
    action: 'AUCTION_BUY_NOW',
    entity: 'Auction',
    entityId: req.params.id,
    metadata: { amount: Number(result.auction.currentPrice) },
    ip: req.ip,
  });
  return created(res, {
    currentPrice: Number(result.auction.currentPrice),
    status: result.auction.status,
    winnerId: result.auction.winnerId,
  });
}

export async function cancel(req: Request, res: Response) {
  const auction = await svc.cancelAuction(req.params.id);
  audit({ userId: req.user!.id, action: 'AUCTION_CANCEL', entity: 'Auction', entityId: auction.id, ip: req.ip });
  return ok(res, auction);
}
