import { ApiProperty } from '@nestjs/swagger';

export class UserUsageDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  totalTokensUsed!: number;

  @ApiProperty()
  totalSttMinutes!: number;

  @ApiProperty()
  totalTtsMinutes!: number;

  @ApiProperty()
  estimatedCost!: number;
}
