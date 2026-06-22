import pino from 'pino';
import { env, isProd } from './env';

/**
 * Structured JSON logger (pino).
 *
 * - In production we emit raw JSON lines, which log shippers (Datadog, Loki,
 *   CloudWatch, etc.) ingest natively.
 * - In development we pretty-print for human readability.
 * - We redact obvious secrets so tokens/passwords never reach the logs.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.passwordHash',
      '*.token',
      '*.accessToken',
      '*.refreshToken',
    ],
    censor: '[redacted]',
  },
  transport: isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
      },
});
