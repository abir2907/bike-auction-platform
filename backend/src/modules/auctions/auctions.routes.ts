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
// Only regular users can bid — admins are staff, not buyers.
router.post('/:id/bids', authenticate, authorize('USER'), validate(placeBidSchema), asyncHandler(ctrl.placeBid));

// ── Direct buy ("buy now"). Only regular users can purchase. ──
router.post('/:id/buy-now', authenticate, authorize('USER'), validate(auctionIdSchema), asyncHandler(ctrl.buyNow));

// ── Lifecycle ──
// Creating an auction is allowed for the vehicle's owner (seller) or an admin;
// ownership is enforced in the service. Cancelling stays admin-only.
router.post('/', authenticate, authorize('USER', 'ADMIN'), validate(createAuctionSchema), asyncHandler(ctrl.create));
router.post('/:id/cancel', authenticate, authorize('ADMIN'), validate(auctionIdSchema), asyncHandler(ctrl.cancel));

export default router;
