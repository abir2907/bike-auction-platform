import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import { env } from './config/env';
import { requestContext } from './middleware/requestContext';
import { apiLimiter } from './middleware/rateLimit';
import { metricsHandler, metricsMiddleware } from './middleware/metrics';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/error';
import apiRouter from './routes';

export function createApp(): Application {
  const app = express();

  // Behind Render/Vercel/NGINX we trust the first proxy so `req.ip`,
  // rate-limiting and secure cookies work with the real client IP.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // ── Security headers (Helmet) ──
  // Sets a hardened set of HTTP headers: HSTS, X-Content-Type-Options,
  // X-Frame-Options (clickjacking), Referrer-Policy, etc. CSP is configured
  // for an API (no inline scripts served).
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // ── CORS ──
  // Only our known frontend origin may call the API, and we allow credentials
  // so the httpOnly refresh cookie is sent on /auth/refresh.
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    }),
  );

  // ── Body / parsing ──
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // ── Hardening ──
  app.use(hpp()); // strips duplicate query params (HTTP parameter pollution)
  app.use(compression());

  // ── Observability ──
  app.use(requestContext); // correlation id + structured access logs
  app.use(metricsMiddleware); // prometheus request histogram

  // ── Health & metrics (unauthenticated, excluded from rate limiting) ──
  app.get('/health', (_req: Request, res: Response) =>
    res.json({ status: 'ok', service: env.APP_NAME, time: new Date().toISOString() }),
  );
  app.get('/metrics', metricsHandler);

  // ── API ──
  app.use('/api', apiLimiter, apiRouter);

  // ── Fallbacks ──
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
