import { Request, Response } from 'express';
import { created, noContent, ok } from '../../utils/response';
import { audit } from '../../utils/audit';
import * as svc from './admin.service';

// Dashboard
export const dashboard = async (_req: Request, res: Response) => ok(res, await svc.dashboard());

// Users
export const listUsers = async (req: Request, res: Response) => {
  const { items, meta } = await svc.listUsers(req.query as never);
  return ok(res, items, 200, meta);
};
export const updateUser = async (req: Request, res: Response) => {
  const user = await svc.updateUser(req.params.id, req.user!.id, req.body);
  audit({ userId: req.user!.id, action: 'ADMIN_USER_UPDATE', entity: 'User', entityId: user.id, ip: req.ip });
  return ok(res, user);
};
export const deleteUser = async (req: Request, res: Response) => {
  await svc.deleteUser(req.params.id, req.user!.id);
  audit({ userId: req.user!.id, action: 'ADMIN_USER_DELETE', entity: 'User', entityId: req.params.id, ip: req.ip });
  return noContent(res);
};

// Vehicles
export const listVehicles = async (req: Request, res: Response) => {
  const { items, meta } = await svc.listVehicles(req.query as never);
  return ok(res, items, 200, meta);
};
export const moderateVehicle = async (req: Request, res: Response) => {
  const v = await svc.moderateVehicle(req.params.id, req.body);
  audit({ userId: req.user!.id, action: 'ADMIN_VEHICLE_MODERATE', entity: 'Vehicle', entityId: v.id, metadata: req.body, ip: req.ip });
  return ok(res, v);
};
export const deleteVehicle = async (req: Request, res: Response) => {
  await svc.deleteVehicle(req.params.id);
  audit({ userId: req.user!.id, action: 'ADMIN_VEHICLE_DELETE', entity: 'Vehicle', entityId: req.params.id, ip: req.ip });
  return noContent(res);
};

// Inquiries
export const listInquiries = async (req: Request, res: Response) => {
  const { items, meta } = await svc.listInquiries(req.query as never);
  return ok(res, items, 200, meta);
};
export const updateInquiry = async (req: Request, res: Response) =>
  ok(res, await svc.updateInquiry(req.params.id, req.body.status));
export const deleteInquiry = async (req: Request, res: Response) => {
  await svc.deleteInquiry(req.params.id);
  return noContent(res);
};

// CMS — FAQs
export const listFaqs = async (_req: Request, res: Response) => ok(res, await svc.listFaqs());
export const createFaq = async (req: Request, res: Response) => created(res, await svc.createFaq(req.body));
export const updateFaq = async (req: Request, res: Response) => ok(res, await svc.updateFaq(req.params.id, req.body));
export const deleteFaq = async (req: Request, res: Response) => {
  await svc.deleteFaq(req.params.id);
  return noContent(res);
};

// CMS — Testimonials
export const listTestimonials = async (_req: Request, res: Response) => ok(res, await svc.listTestimonials());
export const createTestimonial = async (req: Request, res: Response) => created(res, await svc.createTestimonial(req.body));
export const updateTestimonial = async (req: Request, res: Response) => ok(res, await svc.updateTestimonial(req.params.id, req.body));
export const deleteTestimonial = async (req: Request, res: Response) => {
  await svc.deleteTestimonial(req.params.id);
  return noContent(res);
};

// CMS — Site content
export const listSiteContent = async (_req: Request, res: Response) => ok(res, await svc.listSiteContent());
export const upsertSiteContent = async (req: Request, res: Response) =>
  ok(res, await svc.upsertSiteContent(req.body.key, req.body.value));
