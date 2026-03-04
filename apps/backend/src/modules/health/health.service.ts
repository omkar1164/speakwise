import { HealthRepository } from './health.repository.js';

export type HealthStatusResponse = {
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected';
};

export class HealthService {
  constructor(private readonly repository: HealthRepository) {}

  async getHealthStatus(): Promise<HealthStatusResponse> {
    const isConnected = await this.repository.isDatabaseConnected();

    return {
      status: isConnected ? 'ok' : 'error',
      database: isConnected ? 'connected' : 'disconnected',
    };
  }
}
