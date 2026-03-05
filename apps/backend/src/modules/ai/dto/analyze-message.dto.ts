import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';
import { ProficiencyLevel } from '@prisma/client';

export class AnalyzeMessageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  message!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  topic!: string;

  @ApiProperty({ enum: ProficiencyLevel })
  @IsEnum(ProficiencyLevel)
  proficiencyLevel!: ProficiencyLevel;
}
