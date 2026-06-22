import { Request, Response } from 'express';
import { ok } from '../../utils/response';
import * as svc from './cms.service';

export async function faqs(_req: Request, res: Response) {
  return ok(res, await svc.getPublishedFaqs());
}

export async function testimonials(_req: Request, res: Response) {
  return ok(res, await svc.getPublishedTestimonials());
}

export async function content(_req: Request, res: Response) {
  return ok(res, await svc.getSiteContent());
}

export async function stats(_req: Request, res: Response) {
  return ok(res, await svc.getStats());
}
