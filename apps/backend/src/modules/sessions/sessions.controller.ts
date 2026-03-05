import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionMessageDto } from './dto/session-message.dto';
import { SessionMessageResponseDto } from './dto/session-message-response.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { SessionsService } from './sessions.service';
import type { Session } from '@prisma/client';

type AuthenticatedRequest = FastifyRequest & { user: { sub: string } };

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @ApiCreatedResponse({ type: Object })
  start(@Req() req: AuthenticatedRequest, @Body() dto: StartSessionDto): Promise<Session> {
    return this.sessionsService.startSession(req.user.sub, dto);
  }

  @Post(':id/message')
  @ApiOkResponse({ type: SessionMessageResponseDto })
  message(
    @Req() req: AuthenticatedRequest,
    @Param('id') sessionId: string,
    @Body() dto: SessionMessageDto,
  ): Promise<SessionMessageResponseDto> {
    return this.sessionsService.processMessage(req.user.sub, sessionId, dto);
  }
}
