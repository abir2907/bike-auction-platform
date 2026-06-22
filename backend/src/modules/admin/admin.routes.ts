import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './admin.controller';
import {
  faqSchema,
  faqUpdateSchema,
  idParam,
  listInquiriesSchema,
  listUsersSchema,
  listVehiclesSchema,
  moderateVehicleSchema,
  siteContentSchema,
  testimonialSchema,
  testimonialUpdateSchema,
  updateInquirySchema,
  updateUserSchema,
} from './admin.validation';

const router = Router();

// Every admin route is gated: must be authenticated AND have the ADMIN role.
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', asyncHandler(ctrl.dashboard));

// Users
router.get('/users', validate(listUsersSchema), asyncHandler(ctrl.listUsers));
router.patch('/users/:id', validate(updateUserSchema), asyncHandler(ctrl.updateUser));
router.delete('/users/:id', validate(idParam), asyncHandler(ctrl.deleteUser));

// Vehicles
router.get('/vehicles', validate(listVehiclesSchema), asyncHandler(ctrl.listVehicles));
router.patch('/vehicles/:id', validate(moderateVehicleSchema), asyncHandler(ctrl.moderateVehicle));
router.delete('/vehicles/:id', validate(idParam), asyncHandler(ctrl.deleteVehicle));

// Inquiries
router.get('/inquiries', validate(listInquiriesSchema), asyncHandler(ctrl.listInquiries));
router.patch('/inquiries/:id', validate(updateInquirySchema), asyncHandler(ctrl.updateInquiry));
router.delete('/inquiries/:id', validate(idParam), asyncHandler(ctrl.deleteInquiry));

// CMS — FAQs
router.get('/faqs', asyncHandler(ctrl.listFaqs));
router.post('/faqs', validate(faqSchema), asyncHandler(ctrl.createFaq));
router.patch('/faqs/:id', validate(faqUpdateSchema), asyncHandler(ctrl.updateFaq));
router.delete('/faqs/:id', validate(idParam), asyncHandler(ctrl.deleteFaq));

// CMS — Testimonials
router.get('/testimonials', asyncHandler(ctrl.listTestimonials));
router.post('/testimonials', validate(testimonialSchema), asyncHandler(ctrl.createTestimonial));
router.patch('/testimonials/:id', validate(testimonialUpdateSchema), asyncHandler(ctrl.updateTestimonial));
router.delete('/testimonials/:id', validate(idParam), asyncHandler(ctrl.deleteTestimonial));

// CMS — Site content
router.get('/site-content', asyncHandler(ctrl.listSiteContent));
router.put('/site-content', validate(siteContentSchema), asyncHandler(ctrl.upsertSiteContent));

export default router;
