import { Request, Response } from 'express';
import { ok } from '../../utils/response';
import { audit } from '../../utils/audit';
import * as svc from './users.service';

export async function updateProfile(req: Request, res: Response) {
  const user = await svc.updateProfile(req.user!.id, req.body);
  return ok(res, user);
}

export async function changePassword(req: Request, res: Response) {
  await svc.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  audit({ userId: req.user!.id, action: 'USER_CHANGE_PASSWORD', ip: req.ip });
  return ok(res, { message: 'Password changed successfully' });
}

export async function listSaved(req: Request, res: Response) {
  return ok(res, await svc.listSavedVehicles(req.user!.id));
}

export async function toggleSaved(req: Request, res: Response) {
  return ok(res, await svc.toggleSavedVehicle(req.user!.id, req.params.vehicleId));
}

export async function listInquiries(req: Request, res: Response) {
  return ok(res, await svc.listMyInquiries(req.user!.id));
}

export async function listBids(req: Request, res: Response) {
  return ok(res, await svc.listMyBids(req.user!.id));
}
