import { PrismaClient } from '@prisma/client';
import { env, isProd } from './env';
import { logger } from './logger';

/**
 * Single shared PrismaClient instance.
 *
 * In dev with hot-reload (ts-node-dev) modules get re-evaluated, which would
 * otherwise spawn a new client (and a new connection pool) on every reload and
 * exhaust the database connection limit. We cache the instance on `globalThis`
 * to guarantee exactly one client per process.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['warn', 'error'] : ['warn', 'error'],
  });

if (!isProd) globalForPrisma.prisma = prisma;

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info('✅ Database connected');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}

void env; // ensure env is validated before any db usage
