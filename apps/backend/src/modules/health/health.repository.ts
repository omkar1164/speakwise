import { prisma } from '../../config/database.js';

export class HealthRepository {
  async isDatabaseConnected(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
