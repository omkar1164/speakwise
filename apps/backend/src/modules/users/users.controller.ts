import { Controller, Get, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

type AuthenticatedRequest = FastifyRequest & { user: { sub: string } };

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserResponseDto })
  async me(@Req() req: AuthenticatedRequest): Promise<UserResponseDto> {
    const user = await this.usersService.getById(req.user.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      proficiencyLevel: user.proficiencyLevel,
      xp: user.xp,
      streak: user.streak,
      createdAt: user.createdAt,
    };
  }
}
