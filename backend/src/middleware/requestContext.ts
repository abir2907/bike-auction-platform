import { randomUUID } from 'crypto';
import pinoHttp from 'pino-http';
import { logger } from '../config/logger';

/**
 * Attaches a correlation id to every request (honouring an inbound
 * `x-request-id` if a gateway already set one) and emits a structured access
 * log line per request. The id is echoed back in the response header so a
 * client error can be traced end-to-end through the logs.
 */
export const requestContext = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existing = (req.headers['x-request-id'] as string) || randomUUID();
    res.setHeader('x-request-id', existing);
    return existing;
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});
