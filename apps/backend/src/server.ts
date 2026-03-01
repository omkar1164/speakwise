import 'dotenv/config';
import Fastify from 'fastify';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { HealthController } from './modules/health/health.controller.js';

const port = Number(process.env.PORT ?? '3001');
const host = process.env.HOST ?? '0.0.0.0';
const nodeEnv = process.env.NODE_ENV ?? 'development';

const server = Fastify({
  logger: nodeEnv === 'production' ? { level: 'warn' } : { level: 'info' },
});

const healthController = new HealthController();
healthController.register(server);

const start = async (): Promise<void> => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  await connectDatabase();
  await server.listen({ port, host });
};

const shutdown = async (): Promise<void> => {
  await server.close();
  await disconnectDatabase();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

void start().catch(async (error) => {
  server.log.error(error);
  await disconnectDatabase();
  process.exit(1);
});
