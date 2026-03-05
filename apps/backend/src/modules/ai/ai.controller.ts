import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyzeMessageDto } from './dto/analyze-message.dto';
import { AiStructuredResponseDto } from './dto/ai-response.dto';
import {
  SpeechToTextDto,
  SpeechToTextResponseDto,
  TextToSpeechDto,
  TextToSpeechResponseDto,
} from './dto/speech.dto';
import { AiService } from './ai.service';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  @ApiOkResponse({ type: AiStructuredResponseDto })
  analyzeMessage(@Body() dto: AnalyzeMessageDto): Promise<AiStructuredResponseDto> {
    return this.aiService.analyzeMessage(dto);
  }

  @Post('stt')
  @ApiOkResponse({ type: SpeechToTextResponseDto })
  async speechToText(@Body() dto: SpeechToTextDto): Promise<SpeechToTextResponseDto> {
    const transcript = await this.aiService.speechToText(dto.audioBase64);
    return { transcript };
  }

  @Post('tts')
  @ApiOkResponse({ type: TextToSpeechResponseDto })
  async textToSpeech(@Body() dto: TextToSpeechDto): Promise<TextToSpeechResponseDto> {
    const audioBase64 = await this.aiService.textToSpeech(dto.text);
    return { audioBase64 };
  }
}
