import { ApiProperty } from '@nestjs/swagger';
import { ProficiencyLevel } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class SessionMessageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  content!: string;

  @ApiProperty({ enum: ProficiencyLevel })
  @IsEnum(ProficiencyLevel)
  proficiencyLevel!: ProficiencyLevel;
}
