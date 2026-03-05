import { ApiProperty } from '@nestjs/swagger';

export class CorrectionDto {
  @ApiProperty()
  incorrect!: string;

  @ApiProperty()
  corrected!: string;

  @ApiProperty()
  explanation!: string;
}

export class ReplyAnalyticsDto {
  @ApiProperty()
  grammarErrors!: number;

  @ApiProperty()
  complexityScore!: number;
}

export class AiStructuredResponseDto {
  @ApiProperty()
  reply!: string;

  @ApiProperty({ type: [CorrectionDto] })
  corrections!: CorrectionDto[];

  @ApiProperty({ type: ReplyAnalyticsDto })
  analytics!: ReplyAnalyticsDto;

  @ApiProperty()
  exitDetected!: boolean;

  @ApiProperty()
  tokenUsage!: number;
}
