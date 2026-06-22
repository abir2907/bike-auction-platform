import { Request, Response } from 'express';
import { created } from '../../utils/response';
import { audit } from '../../utils/audit';
import * as svc from './inquiries.service';

export async function create(req: Request, res: Response) {
  const inquiry = await svc.create(req.body, req.user?.id);
  audit({
    userId: req.user?.id ?? null,
    action: 'INQUIRY_CREATE',
    entity: 'Vehicle',
    entityId: req.body.vehicleId,
    ip: req.ip,
  });
  return created(res, { id: inquiry.id, message: 'Thanks! The team will reach out shortly.' });
}
