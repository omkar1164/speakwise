import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { GamificationModule } from '../gamification/gamification.module';
import { MessagesModule } from '../messages/messages.module';
import { SessionsController } from './sessions.controller';
import { SessionsRepository } from './sessions.repository';
import { SessionsService } from './sessions.service';

@Module({
  imports: [MessagesModule, AiModule, AnalyticsModule, GamificationModule],
  controllers: [SessionsController],
  providers: [SessionsRepository, SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
