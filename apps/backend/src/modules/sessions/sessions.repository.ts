import { Injectable } from '@nestjs/common';
import { type Prisma, type Session } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.SessionCreateInput): Promise<Session> {
    return this.prisma.session.create({ data });
  }

  findById(id: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { id } });
  }

  complete(id: string, endedAt: Date, durationSec: number): Promise<Session> {
    return this.prisma.session.update({
      where: { id },
      data: { endedAt, durationSec },
    });
  }
}
