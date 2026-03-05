import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserUsageDto } from './dto/user-usage.dto';
import { AdminService } from './admin.service';
import type { UserUsage } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('usage')
  @ApiOkResponse({ type: [UserUsageDto] })
  usage(): Promise<UserUsage[]> {
    return this.adminService.getUsage();
  }
}
