import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './auctions.controller';
import {
  auctionIdSchema,
  createAuctionSchema,
  listAuctionsSchema,
  placeBidSchema,
} from './auctions.validation';

const router = Router();

// ── Public ──
router.get('/', validate(listAuctionsSchema), asyncHandler(ctrl.list));
router.get('/:id', validate(auctionIdSchema), asyncHandler(ctrl.getById));
router.get('/:id/bids', validate(auctionIdSchema), asyncHandler(ctrl.getBids));

// ── Authenticated bidding (REST fallback; primary path is WebSocket) ──
router.post('/:id/bids', authenticate, validate(placeBidSchema), asyncHandler(ctrl.placeBid));

// ── Admin lifecycle ──
router.post('/', authenticate, authorize('ADMIN'), validate(createAuctionSchema), asyncHandler(ctrl.create));
router.post('/:id/cancel', authenticate, authorize('ADMIN'), validate(auctionIdSchema), asyncHandler(ctrl.cancel));

export default router;
