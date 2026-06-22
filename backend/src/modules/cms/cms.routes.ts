import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './cms.controller';

const router = Router();

router.get('/faqs', asyncHandler(ctrl.faqs));
router.get('/testimonials', asyncHandler(ctrl.testimonials));
router.get('/content', asyncHandler(ctrl.content));
router.get('/stats', asyncHandler(ctrl.stats));

export default router;
