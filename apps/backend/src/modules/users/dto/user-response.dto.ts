import { ApiProperty } from '@nestjs/swagger';
import { ProficiencyLevel } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ProficiencyLevel })
  proficiencyLevel!: ProficiencyLevel;

  @ApiProperty()
  xp!: number;

  @ApiProperty()
  streak!: number;

  @ApiProperty()
  createdAt!: Date;
}
