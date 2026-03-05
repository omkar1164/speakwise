import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { validateEnv } from '../shared/config/env.validation';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { GamificationModule } from './gamification/gamification.module';
import { MessagesModule } from './messages/messages.module';
import { SessionsModule } from './sessions/sessions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 120,
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SessionsModule,
    MessagesModule,
    AiModule,
    AnalyticsModule,
    GamificationModule,
    AdminModule,
  ],
})
export class AppModule {}
