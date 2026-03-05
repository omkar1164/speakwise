import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import type { UpdateGamificationDto } from './dto/update-gamification.dto';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async applySessionRewards(dto: UpdateGamificationDto): Promise<User> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: dto.userId } });
      const lastSession = await tx.session.findFirst({
        where: { userId: dto.userId, endedAt: { not: null } },
        orderBy: { endedAt: 'desc' },
      });

      const streak = this.nextStreak(lastSession?.endedAt ?? null, dto.sessionDateIso, user.streak);
      const streakBonus = streak >= 7 ? 10 : streak >= 3 ? 5 : 0;

      let earnedXp = 10;
      if (dto.grammarErrors < 3) {
        earnedXp += 5;
      }
      if (dto.fillerCount === 0) {
        earnedXp += 5;
      }
      earnedXp += streakBonus;

      return tx.user.update({
        where: { id: dto.userId },
        data: {
          xp: { increment: earnedXp },
          streak,
        },
      });
    });
  }

  private nextStreak(
    lastSessionDate: Date | null,
    currentSessionIso: string,
    currentStreak: number,
  ): number {
    if (!lastSessionDate) {
      return 1;
    }

    const previous = new Date(lastSessionDate);
    previous.setHours(0, 0, 0, 0);

    const current = new Date(currentSessionIso);
    current.setHours(0, 0, 0, 0);

    const diffDays = Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      return currentStreak + 1;
    }
    if (diffDays > 1) {
      return 1;
    }
    return currentStreak;
  }
}
