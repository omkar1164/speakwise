import { Injectable } from '@nestjs/common';
import { type Message, type Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class MessagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MessageCreateInput): Promise<Message> {
    return this.prisma.message.create({ data });
  }

  findBySessionId(sessionId: string): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
