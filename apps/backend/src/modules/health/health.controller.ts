import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export class HealthController {
  register(fastify: FastifyInstance): void {
    fastify.get('/health', this.getHealth.bind(this));
  }

  private async getHealth(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await reply.status(200).send({
      status: 'ok',
      service: 'backend',
      timestamp: new Date().toISOString(),
    });
  }
}
