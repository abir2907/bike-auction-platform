import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/prisma';
import { initSocket } from './realtime/socket';
import { startAuctionScheduler, stopAuctionScheduler } from './realtime/scheduler';

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);

  initSocket(server);
  startAuctionScheduler();

  server.listen(env.PORT, () => {
    logger.info(`🚀 ${env.APP_NAME} API listening on http://localhost:${env.PORT}`);
    logger.info(`   Env: ${env.NODE_ENV} | Metrics: ${env.METRICS_ENABLED ? 'on' : 'off'}`);
  });

  // ── Graceful shutdown ──
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    stopAuctionScheduler();
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    // Force-exit if connections don't drain in time.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => logger.error({ reason }, 'Unhandled promise rejection'));
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception — exiting');
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
