import { NextFunction, Request, Response } from 'express';
import client from 'prom-client';
import { env } from '../config/env';

/**
 * Prometheus metrics. We collect default Node/process metrics plus a custom
 * HTTP request histogram (latency + count by method/route/status). Exposed at
 * GET /metrics for scraping by Prometheus / Grafana Cloud / Datadog.
 */
export const registry = new client.Registry();
registry.setDefaultLabels({ app: 'vutto-auctions-api' });
client.collectDefaultMetrics({ register: registry });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [registry],
});

export const activeAuctionsGauge = new client.Gauge({
  name: 'auctions_live_total',
  help: 'Number of auctions currently live',
  registers: [registry],
});

export const bidsCounter = new client.Counter({
  name: 'bids_placed_total',
  help: 'Total number of accepted bids',
  registers: [registry],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!env.METRICS_ENABLED) return next();
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    // Use the matched route pattern (e.g. /api/vehicles/:id) to avoid label explosion.
    const route = req.route?.path
      ? `${req.baseUrl}${req.route.path}`
      : req.path.replace(/\/[0-9a-f-]{8,}/gi, '/:id');
    end({ method: req.method, route, status: res.statusCode });
  });
  next();
}

export async function metricsHandler(_req: Request, res: Response) {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
}
