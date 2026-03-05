import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateSessionAnalyticsDto {
  @ApiProperty()
  @IsString()
  sessionId!: string;

  @ApiProperty()
  @IsString()
  text!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  durationSec!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  grammarErrors!: number;
}
