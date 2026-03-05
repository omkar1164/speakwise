import {
  GatewayTimeoutException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProficiencyLevel } from '@prisma/client';
import { createHash } from 'crypto';
import { buildBasePrompt } from './prompts/base.prompt';
import type { AnalyzeMessageDto } from './dto/analyze-message.dto';
import type { AiStructuredResponseDto } from './dto/ai-response.dto';

type OpenAiResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { total_tokens?: number };
};

@Injectable()
export class AiService {
  private readonly endpoint = 'https://api.openai.com/v1/chat/completions';
  private readonly responseCache = new Map<string, AiStructuredResponseDto>();

  constructor(private readonly configService: ConfigService) {}

  async generateConversationReply(input: AnalyzeMessageDto): Promise<AiStructuredResponseDto> {
    return this.analyzeMessage(input);
  }

  async generateSessionSummary(text: string): Promise<string> {
    const payload: AnalyzeMessageDto = {
      message: `Summarize this session in 3 bullets:\n${text}`,
      topic: 'Session Summary',
      proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    };
    const result = await this.analyzeMessage(payload);
    return result.reply;
  }

  async speechToText(audioBase64: string): Promise<string> {
    const apiKey = this.configService.get<string>('ELEVENLABS_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('ELEVENLABS_API_KEY is not configured');
    }

    const binary = Buffer.from(audioBase64, 'base64');
    const formData = new FormData();
    const blob = new Blob([binary], { type: 'audio/webm' });
    formData.append('file', blob, 'voice.webm');
    formData.append('model_id', 'scribe_v1');

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(`STT failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { text?: string; transcript?: string };
    const transcript = payload.text ?? payload.transcript ?? '';
    if (!transcript.trim()) {
      throw new InternalServerErrorException('STT returned empty transcript');
    }
    return transcript.trim();
  }

  async textToSpeech(text: string): Promise<string> {
    const apiKey = this.configService.get<string>('ELEVENLABS_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('ELEVENLABS_API_KEY is not configured');
    }

    const response = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL/stream',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
        }),
      },
    );

    if (!response.ok) {
      throw new ServiceUnavailableException(`TTS failed with status ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.toString('base64');
  }

  detectExitIntent(text: string): boolean {
    const normalized = text.trim().toLowerCase();
    return ['stop', 'exit', 'end session', 'that is all'].some((phrase) =>
      normalized.includes(phrase),
    );
  }

  async analyzeMessage(input: AnalyzeMessageDto): Promise<AiStructuredResponseDto> {
    const cached = this.responseCache.get(this.cacheKey(input));
    if (cached) {
      return cached;
    }

    const prompt = buildBasePrompt(input.proficiencyLevel, input.topic);
    const response = await this.callWithRetry(prompt, input.message);
    const parsed = this.parseStructuredResponse(response.content);

    const enriched: AiStructuredResponseDto = {
      ...parsed,
      exitDetected: parsed.exitDetected || this.detectExitIntent(input.message),
      tokenUsage: response.totalTokens,
    };

    this.responseCache.set(this.cacheKey(input), enriched);
    return enriched;
  }

  private async callWithRetry(
    prompt: string,
    message: string,
  ): Promise<{ content: string; totalTokens: number }> {
    let attempt = 0;
    let lastError: unknown = null;

    while (attempt < 3) {
      attempt += 1;
      try {
        return await this.callOpenAi(prompt, message);
      } catch (error) {
        lastError = error;
      }
    }

    throw new ServiceUnavailableException(
      `AI provider unavailable after retries: ${String(lastError)}`,
    );
  }

  private async callOpenAi(
    prompt: string,
    message: string,
  ): Promise<{ content: string; totalTokens: number }> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('OPENAI_API_KEY is not configured');
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 12000);

    try {
      const result = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        signal: abortController.signal,
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.4,
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: message },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!result.ok) {
        throw new ServiceUnavailableException(`OpenAI error: ${result.status}`);
      }

      const payload = (await result.json()) as OpenAiResponse;
      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        throw new InternalServerErrorException('AI response missing content');
      }

      return {
        content,
        totalTokens: payload.usage?.total_tokens ?? 0,
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new GatewayTimeoutException('AI call timed out');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseStructuredResponse(value: string): AiStructuredResponseDto {
    const parsed = JSON.parse(value) as Partial<AiStructuredResponseDto>;
    if (!parsed.reply || typeof parsed.reply !== 'string') {
      throw new InternalServerErrorException('Invalid AI response: reply missing');
    }

    return {
      reply: parsed.reply,
      corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],
      analytics: parsed.analytics ?? { grammarErrors: 0, complexityScore: 0 },
      exitDetected: parsed.exitDetected ?? false,
      tokenUsage: parsed.tokenUsage ?? 0,
    };
  }

  private cacheKey(input: AnalyzeMessageDto): string {
    return createHash('sha256')
      .update(`${input.proficiencyLevel}:${input.topic}:${input.message}`)
      .digest('hex');
  }
}
