import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './users.controller';
import { changePasswordSchema, savedParamSchema, updateProfileSchema } from './users.validation';

const router = Router();

// Everything here is "me"-scoped and requires authentication.
router.use(authenticate);

router.patch('/me', validate(updateProfileSchema), asyncHandler(ctrl.updateProfile));
router.post('/me/change-password', validate(changePasswordSchema), asyncHandler(ctrl.changePassword));

router.get('/me/saved', asyncHandler(ctrl.listSaved));
router.post('/me/saved/:vehicleId', validate(savedParamSchema), asyncHandler(ctrl.toggleSaved));

router.get('/me/inquiries', asyncHandler(ctrl.listInquiries));
router.get('/me/bids', asyncHandler(ctrl.listBids));

export default router;
