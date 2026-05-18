import 'dotenv/config';
import { createServer } from 'http';
import { app } from './app';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { initSocketServer } from './config/socket';
import { logger } from './utils/logger';
import { env } from './config/env';

async function bootstrap() {
  await connectDatabase();
  await connectRedis();

  const httpServer = createServer(app);
  initSocketServer(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    httpServer.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Bootstrap failed', { error: err.message });
  process.exit(1);
});
