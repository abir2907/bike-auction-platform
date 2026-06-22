import { Request, Response } from 'express';
import { created, ok } from '../../utils/response';
import { audit } from '../../utils/audit';
import * as svc from './vehicles.service';

export async function list(req: Request, res: Response) {
  const { items, meta } = await svc.listPublic(req.query as unknown as svc.ListFilters);
  return ok(res, items, 200, meta);
}

export async function featured(_req: Request, res: Response) {
  return ok(res, await svc.getFeatured());
}

export async function getBySlug(req: Request, res: Response) {
  return ok(res, await svc.getBySlug(req.params.slug));
}

export async function similar(req: Request, res: Response) {
  return ok(res, await svc.getSimilar(req.params.id));
}

export async function create(req: Request, res: Response) {
  const vehicle = await svc.createListing(req.user!.id, req.body);
  audit({ userId: req.user!.id, action: 'VEHICLE_CREATE', entity: 'Vehicle', entityId: vehicle.id, ip: req.ip });
  return created(res, vehicle);
}

export async function listMine(req: Request, res: Response) {
  return ok(res, await svc.listMine(req.user!.id));
}

export async function update(req: Request, res: Response) {
  const isAdmin = req.user!.role === 'ADMIN';
  const vehicle = await svc.updateListing(req.params.id, req.user!.id, isAdmin, req.body);
  audit({ userId: req.user!.id, action: 'VEHICLE_UPDATE', entity: 'Vehicle', entityId: vehicle.id, ip: req.ip });
  return ok(res, vehicle);
}

export async function remove(req: Request, res: Response) {
  const isAdmin = req.user!.role === 'ADMIN';
  await svc.deleteListing(req.params.id, req.user!.id, isAdmin);
  audit({ userId: req.user!.id, action: 'VEHICLE_DELETE', entity: 'Vehicle', entityId: req.params.id, ip: req.ip });
  return ok(res, { message: 'Listing deleted' });
}
