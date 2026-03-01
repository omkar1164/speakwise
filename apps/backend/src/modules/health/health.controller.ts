import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { HealthRepository } from './health.repository.js';
import { HealthService } from './health.service.js';

export class HealthController {
  private readonly service: HealthService;

  constructor() {
    const repository = new HealthRepository();
    this.service = new HealthService(repository);
  }

  register(fastify: FastifyInstance): void {
    fastify.get('/health', this.getHealth.bind(this));
  }

  private async getHealth(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.service.getHealthStatus();
    const statusCode = result.database === 'connected' ? 200 : 503;

    await reply.status(statusCode).send(result);
  }
}
