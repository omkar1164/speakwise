import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class UpdateGamificationDto {
  @ApiProperty()
  @IsString()
  userId!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  grammarErrors!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  fillerCount!: number;

  @ApiProperty()
  @IsString()
  sessionDateIso!: string;
}
