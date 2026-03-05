import { Injectable } from '@nestjs/common';
import type { SessionAnalytics } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { calculateVocabularyDiversity, calculateWPM, countWords, detectFillerWords } from './analytics.utils';
import type { CreateSessionAnalyticsDto } from './dto/create-session-analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdateSessionAnalytics(
    dto: CreateSessionAnalyticsDto,
  ): Promise<SessionAnalytics> {
    const wordCount = countWords(dto.text);
    const fillerCount = detectFillerWords(dto.text);
    const avgWpm = calculateWPM(wordCount, dto.durationSec);
    const vocabularyDiversity = calculateVocabularyDiversity(dto.text);

    return this.prisma.sessionAnalytics.upsert({
      where: { sessionId: dto.sessionId },
      create: {
        sessionId: dto.sessionId,
        wordCount,
        fillerCount,
        grammarErrors: dto.grammarErrors,
        avgWpm,
        vocabularyDiversity,
      },
      update: {
        wordCount,
        fillerCount,
        grammarErrors: dto.grammarErrors,
        avgWpm,
        vocabularyDiversity,
      },
    });
  }
}
