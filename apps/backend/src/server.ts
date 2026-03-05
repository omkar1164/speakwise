import 'dotenv/config';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import Fastify from 'fastify';
import { env } from './env.js';
import { HealthController } from './modules/health/health.controller.js';
import { aiRoutes } from './routes/ai.js';

const port = env.PORT;
const host = env.HOST;
const nodeEnv = env.NODE_ENV;

const server = Fastify({
  logger: nodeEnv === 'production' ? { level: 'warn' } : { level: 'info' },
});

const healthController = new HealthController();
healthController.register(server);
void server.register(cors, { origin: env.CORS_ORIGIN });
void server.register(multipart);
void server.register(aiRoutes);

const start = async (): Promise<void> => {
  await server.listen({ port, host });
};

const shutdown = async (): Promise<void> => {
  await server.close();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

void start().catch(async (error) => {
  server.log.error(error);
  process.exit(1);
});
