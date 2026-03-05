import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SpeechToTextDto {
  @ApiProperty({ description: 'Base64-encoded audio data' })
  @IsString()
  @MinLength(1)
  audioBase64!: string;
}

export class SpeechToTextResponseDto {
  @ApiProperty()
  transcript!: string;
}

export class TextToSpeechDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  text!: string;
}

export class TextToSpeechResponseDto {
  @ApiProperty({ description: 'Base64-encoded mp3 output' })
  audioBase64!: string;
}
