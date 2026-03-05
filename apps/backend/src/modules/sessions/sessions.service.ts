import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageRole, type Session } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { GamificationService } from '../gamification/gamification.service';
import { MessagesService } from '../messages/messages.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { SessionsRepository } from './sessions.repository';
import type { SessionMessageResponseDto } from './dto/session-message-response.dto';
import type { StartSessionDto } from './dto/start-session.dto';
import type { SessionMessageDto } from './dto/session-message.dto';

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly messagesService: MessagesService,
    private readonly aiService: AiService,
    private readonly analyticsService: AnalyticsService,
    private readonly gamificationService: GamificationService,
    private readonly prisma: PrismaService,
  ) {}

  startSession(userId: string, dto: StartSessionDto): Promise<Session> {
    return this.sessionsRepository.create({
      topic: dto.topic,
      user: { connect: { id: userId } },
    });
  }

  async processMessage(
    userId: string,
    sessionId: string,
    dto: SessionMessageDto,
  ): Promise<SessionMessageResponseDto> {
    const session = await this.sessionsRepository.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }

    await this.messagesService.create({
      sessionId,
      role: MessageRole.USER,
      content: dto.content,
    });

    const aiResult = await this.aiService.generateConversationReply({
      message: dto.content,
      topic: session.topic,
      proficiencyLevel: dto.proficiencyLevel,
    });

    await this.messagesService.create({
      sessionId,
      role: MessageRole.AI,
      content: aiResult.reply,
      corrections: aiResult.corrections,
      tokenUsage: aiResult.tokenUsage,
    });

    const allMessages = await this.messagesService.getBySessionId(sessionId);
    const aggregatedText = allMessages.map((m) => m.content).join(' ');
    const sessionDurationSec = Math.max(
      1,
      Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
    );

    const analytics = await this.analyticsService.createOrUpdateSessionAnalytics({
      sessionId,
      text: aggregatedText,
      durationSec: sessionDurationSec,
      grammarErrors: aiResult.analytics.grammarErrors,
    });

    await this.prisma.userUsage.upsert({
      where: { userId },
      create: {
        userId,
        totalTokensUsed: aiResult.tokenUsage,
        estimatedCost: this.estimateOpenAiCost(aiResult.tokenUsage),
      },
      update: {
        totalTokensUsed: { increment: aiResult.tokenUsage },
        estimatedCost: {
          increment: this.estimateOpenAiCost(aiResult.tokenUsage),
        },
      },
    });

    if (aiResult.exitDetected) {
      await this.sessionsRepository.complete(sessionId, new Date(), sessionDurationSec);
      await this.gamificationService.applySessionRewards({
        userId,
        grammarErrors: analytics.grammarErrors,
        fillerCount: analytics.fillerCount,
        sessionDateIso: new Date().toISOString(),
      });
    }

    return {
      sessionId,
      ai: aiResult,
    };
  }

  private estimateOpenAiCost(totalTokens: number): number {
    const pricePerToken = 0.000002;
    return totalTokens * pricePerToken;
  }
}
