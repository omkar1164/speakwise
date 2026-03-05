import type { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';

type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
type OpenAIChatRole = 'system' | 'user' | 'assistant';

type OpenAIChatMessage = {
  role: OpenAIChatRole;
  content: string;
};

type OpenAIChoice = {
  message?: {
    content?: string;
  };
};

type OpenAICompletionResponse = {
  choices?: OpenAIChoice[];
};

type OpenAIRequestBody = {
  messages: OpenAIChatMessage[];
  proficiencyLevel: ProficiencyLevel;
};

type ElevenLabsTtsBody = {
  text: string;
};

type ElevenLabsSttResponse = {
  text?: string;
  transcript?: string;
};

type CorrectionItem = {
  incorrect: string;
  corrected: string;
  explanation: string;
};

type StructuredAssistantResponse = {
  reply: string;
  corrections: CorrectionItem[];
  exitDetected: boolean;
};

const OPENAI_CHAT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const ELEVENLABS_TTS_ENDPOINT = 'https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL/stream';
const ELEVENLABS_STT_ENDPOINT = 'https://api.elevenlabs.io/v1/speech-to-text';

function getCorrectionTonePrompt(level: ProficiencyLevel): string {
  if (level === 'Beginner') {
    return 'Use very simple explanations and fix only the most important errors.';
  }
  if (level === 'Intermediate') {
    return 'Use short explanations and fix key grammar and wording issues.';
  }
  return 'Use concise but precise explanations and include nuanced wording improvements when useful.';
}

function sanitizeStructuredResponse(value: unknown): StructuredAssistantResponse {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Invalid OpenAI response shape.');
  }

  const record = value as Record<string, unknown>;
  const reply = typeof record.reply === 'string' ? record.reply.trim() : '';
  const exitDetected = typeof record.exitDetected === 'boolean' ? record.exitDetected : false;

  const rawCorrections = Array.isArray(record.corrections) ? record.corrections : [];
  const corrections: CorrectionItem[] = rawCorrections
    .map((item) => {
      if (typeof item !== 'object' || item === null) {
        return null;
      }
      const correction = item as Record<string, unknown>;
      const incorrect = typeof correction.incorrect === 'string' ? correction.incorrect.trim() : '';
      const corrected = typeof correction.corrected === 'string' ? correction.corrected.trim() : '';
      const explanation =
        typeof correction.explanation === 'string' ? correction.explanation.trim() : '';

      if (!incorrect || !corrected || !explanation) {
        return null;
      }

      return { incorrect, corrected, explanation };
    })
    .filter((item): item is CorrectionItem => item !== null);

  if (!reply) {
    throw new Error('OpenAI reply is empty.');
  }

  return {
    reply,
    corrections,
    exitDetected,
  };
}

function extractJsonObject(rawContent: string): string {
  const trimmed = rawContent.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  throw new Error('OpenAI response is not valid JSON.');
}

export const aiRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.post(
    '/api/openai/chat',
    async (
      request: FastifyRequest<{ Body: OpenAIRequestBody }>,
      reply: FastifyReply
    ): Promise<void> => {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        await reply.status(500).send({ error: 'OPENAI_API_KEY is not configured on server.' });
        return;
      }

      const messages = Array.isArray(request.body?.messages) ? request.body.messages : [];
      const proficiencyLevel = request.body?.proficiencyLevel;
      const validLevel =
        proficiencyLevel === 'Beginner' ||
        proficiencyLevel === 'Intermediate' ||
        proficiencyLevel === 'Advanced';

      if (!messages.length || !validLevel) {
        await reply.status(400).send({ error: 'Invalid chat payload.' });
        return;
      }

      const controlInstruction: OpenAIChatMessage = {
        role: 'system',
        content: [
          'You must return only valid JSON with this exact shape:',
          '{ "reply": string, "corrections": [{ "incorrect": string, "corrected": string, "explanation": string }], "exitDetected": boolean }',
          'No markdown, no extra keys, no commentary outside JSON.',
          'Keep reply concise and confidence-first.',
          'Always praise briefly before correction.',
          getCorrectionTonePrompt(proficiencyLevel),
        ].join('\n'),
      };

      const openAiResponse = await fetch(OPENAI_CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          stream: false,
          temperature: 0.6,
          messages: [...messages, controlInstruction],
        }),
      });

      if (!openAiResponse.ok) {
        const errorBody = await openAiResponse.text();
        await reply.status(502).send({ error: `OpenAI request failed: ${openAiResponse.status}`, details: errorBody });
        return;
      }

      const payload = (await openAiResponse.json()) as OpenAICompletionResponse;
      const content = payload.choices?.[0]?.message?.content;

      if (!content) {
        await reply.status(502).send({ error: 'OpenAI response content missing.' });
        return;
      }

      const parsed = JSON.parse(extractJsonObject(content)) as unknown;
      const structured = sanitizeStructuredResponse(parsed);
      await reply.status(200).send(structured);
    }
  );

  fastify.post(
    '/api/elevenlabs/tts',
    async (
      request: FastifyRequest<{ Body: ElevenLabsTtsBody }>,
      reply: FastifyReply
    ): Promise<void> => {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        await reply.status(500).send({ error: 'ELEVENLABS_API_KEY is not configured on server.' });
        return;
      }

      const normalizedText = request.body?.text?.trim();
      if (!normalizedText) {
        await reply.status(400).send({ error: 'Text is required for text-to-speech.' });
        return;
      }

      const elevenLabsResponse = await fetch(ELEVENLABS_TTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: normalizedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.7,
          },
        }),
      });

      if (!elevenLabsResponse.ok) {
        const errorBody = await elevenLabsResponse.text();
        await reply
          .status(502)
          .send({ error: `ElevenLabs request failed: ${elevenLabsResponse.status}`, details: errorBody });
        return;
      }

      const audioBuffer = Buffer.from(await elevenLabsResponse.arrayBuffer());
      const contentType = elevenLabsResponse.headers.get('content-type') ?? 'audio/mpeg';
      await reply.status(200).header('content-type', contentType).send(audioBuffer);
    }
  );

  fastify.post('/api/elevenlabs/stt', async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      await reply.status(500).send({ error: 'ELEVENLABS_API_KEY is not configured on server.' });
      return;
    }

    const file = await request.file();
    if (!file) {
      await reply.status(400).send({ error: 'Audio file is required.' });
      return;
    }

    const buffer = await file.toBuffer();
    const mimeType = file.mimetype || 'audio/webm';
    const fileName = file.filename || 'recording.webm';
    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: mimeType }), fileName);
    formData.append('model_id', 'scribe_v1');

    const elevenLabsResponse = await fetch(ELEVENLABS_STT_ENDPOINT, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: formData,
    });

    if (!elevenLabsResponse.ok) {
      const errorBody = await elevenLabsResponse.text();
      await reply
        .status(502)
        .send({ error: `ElevenLabs STT request failed: ${elevenLabsResponse.status}`, details: errorBody });
      return;
    }

    const payload = (await elevenLabsResponse.json()) as ElevenLabsSttResponse;
    const text = (payload.text ?? payload.transcript ?? '').trim();
    if (!text) {
      await reply.status(502).send({ error: 'ElevenLabs STT returned empty transcript.' });
      return;
    }

    await reply.status(200).send({ text });
  });
  done();
};
