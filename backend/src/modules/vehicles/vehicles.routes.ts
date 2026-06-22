import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './vehicles.controller';
import {
  createVehicleSchema,
  idParamSchema,
  listVehiclesSchema,
  slugParamSchema,
  updateVehicleSchema,
} from './vehicles.validation';

const router = Router();

// ── Public ──
router.get('/', validate(listVehiclesSchema), asyncHandler(ctrl.list));
router.get('/featured', asyncHandler(ctrl.featured));

// ── Authenticated seller (must come before the dynamic :slug route) ──
router.get('/me/listings', authenticate, asyncHandler(ctrl.listMine));
router.post('/', authenticate, validate(createVehicleSchema), asyncHandler(ctrl.create));
router.patch('/:id', authenticate, validate(updateVehicleSchema), asyncHandler(ctrl.update));
router.delete('/:id', authenticate, validate(idParamSchema), asyncHandler(ctrl.remove));

// ── Public detail ──
router.get('/:id/similar', validate(idParamSchema), asyncHandler(ctrl.similar));
router.get('/:slug', validate(slugParamSchema), asyncHandler(ctrl.getBySlug));

export default router;
