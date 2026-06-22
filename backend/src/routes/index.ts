import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/users/users.routes';
import vehicleRoutes from '../modules/vehicles/vehicles.routes';
import auctionRoutes from '../modules/auctions/auctions.routes';
import inquiryRoutes from '../modules/inquiries/inquiries.routes';
import cmsRoutes from '../modules/cms/cms.routes';
import adminRoutes from '../modules/admin/admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/auctions', auctionRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/cms', cmsRoutes);
router.use('/admin', adminRoutes);

export default router;
