import { ApiProperty } from '@nestjs/swagger';
import { ProficiencyLevel } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: ProficiencyLevel, required: false })
  @IsOptional()
  @IsEnum(ProficiencyLevel)
  proficiencyLevel?: ProficiencyLevel;
}
