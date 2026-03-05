import { ApiProperty } from '@nestjs/swagger';
import { MessageRole } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  sessionId!: string;

  @ApiProperty({ enum: MessageRole })
  @IsEnum(MessageRole)
  role!: MessageRole;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  corrections?: unknown;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tokenUsage?: number;
}
