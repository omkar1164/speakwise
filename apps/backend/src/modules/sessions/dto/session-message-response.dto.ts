import { ApiProperty } from '@nestjs/swagger';
import { AiStructuredResponseDto } from '../../ai/dto/ai-response.dto';

export class SessionMessageResponseDto {
  @ApiProperty()
  sessionId!: string;

  @ApiProperty({ type: AiStructuredResponseDto })
  ai!: AiStructuredResponseDto;
}
