import { Injectable } from '@nestjs/common';
import { Prisma, type Message } from '@prisma/client';
import { MessagesRepository } from './messages.repository';
import type { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly messagesRepository: MessagesRepository) {}

  create(dto: CreateMessageDto): Promise<Message> {
    return this.messagesRepository.create({
      session: { connect: { id: dto.sessionId } },
      role: dto.role,
      content: dto.content,
      corrections: dto.corrections ?? Prisma.JsonNull,
      tokenUsage: dto.tokenUsage ?? 0,
    });
  }

  getBySessionId(sessionId: string): Promise<Message[]> {
    return this.messagesRepository.findBySessionId(sessionId);
  }
}
