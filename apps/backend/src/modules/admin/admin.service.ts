import { Injectable } from '@nestjs/common';
import type { UserUsage } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  getUsage(): Promise<UserUsage[]> {
    return this.prisma.userUsage.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }
}
