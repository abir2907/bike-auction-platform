import { Response } from 'express';

/**
 * Standard success envelope. Every successful response looks the same:
 *   { success: true, data, meta? }
 * which lets the frontend handle responses uniformly.
 */
export function ok<T>(res: Response, data: T, status = 200, meta?: unknown) {
  return res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function created<T>(res: Response, data: T, meta?: unknown) {
  return ok(res, data, 201, meta);
}

export function noContent(res: Response) {
  return res.status(204).send();
}
