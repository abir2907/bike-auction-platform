import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { isProd } from '../config/env';
import { logger } from '../config/logger';

/**
 * Global error handler — the single place that turns thrown errors into HTTP
 * responses. It normalises:
 *   - ApiError            → its own status/code
 *   - Prisma known errors → friendly 409/404 (e.g. unique constraint)
 *   - everything else     → opaque 500 (details hidden in production)
 *
 * Response shape is always: { success:false, error:{ code, message, details? } }
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    apiError = mapPrismaError(err);
  } else if (err instanceof SyntaxError && 'body' in err) {
    apiError = ApiError.badRequest('Malformed JSON body');
  } else {
    apiError = ApiError.internal();
  }

  // Log 5xx as errors (with stack); 4xx are expected client problems.
  const log = (req as Request & { log?: typeof logger }).log ?? logger;
  if (apiError.statusCode >= 500) {
    log.error({ err, reqId: req.id }, 'Unhandled error');
  } else {
    log.warn({ code: apiError.code, msg: apiError.message, reqId: req.id }, 'Request error');
  }

  res.status(apiError.statusCode).json({
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      ...(apiError.details ? { details: apiError.details } : {}),
      ...(!isProd && apiError.statusCode >= 500 ? { stack: (err as Error)?.stack } : {}),
    },
  });
}

function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): ApiError {
  switch (err.code) {
    case 'P2002': {
      const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
      return ApiError.conflict(`A record with this ${target} already exists`);
    }
    case 'P2025':
      return ApiError.notFound('Record not found');
    case 'P2003':
      return ApiError.badRequest('Related record does not exist');
    default:
      return ApiError.internal('Database error');
  }
}
