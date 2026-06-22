import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { optionalAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './inquiries.controller';
import { createInquirySchema } from './inquiries.validation';

const router = Router();

// Public: anyone can submit a lead. If logged in, we attach their user id.
router.post('/', optionalAuth, validate(createInquirySchema), asyncHandler(ctrl.create));

export default router;
