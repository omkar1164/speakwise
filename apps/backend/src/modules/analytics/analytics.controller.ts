import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSessionAnalyticsDto } from './dto/create-session-analytics.dto';
import { AnalyticsService } from './analytics.service';
import type { SessionAnalytics } from '@prisma/client';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('session')
  @ApiOkResponse({ type: Object })
  create(@Body() dto: CreateSessionAnalyticsDto): Promise<SessionAnalytics> {
    return this.analyticsService.createOrUpdateSessionAnalytics(dto);
  }
}
