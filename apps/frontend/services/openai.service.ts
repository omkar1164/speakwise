import type { ProficiencyLevel } from '@/lib/storage';

export type OpenAIChatRole = 'system' | 'user' | 'assistant';

export type OpenAIChatMessage = {
  role: OpenAIChatRole;
  content: string;
};

export type CorrectionItem = {
  incorrect: string;
  corrected: string;
  explanation: string;
};

export type StructuredAssistantResponse = {
  reply: string;
  corrections: CorrectionItem[];
  exitDetected: boolean;
};

type OpenAIChoice = {
  message?: {
    content?: string;
  };
};

type OpenAICompletionResponse = {
  choices?: OpenAIChoice[];
};

function getOpenAIApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_OPENAI_API_KEY.');
  }
  return apiKey;
}

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

export async function generateReply(
  messages: OpenAIChatMessage[],
  proficiencyLevel: ProficiencyLevel
): Promise<StructuredAssistantResponse> {
  const apiKey = getOpenAIApiKey();

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

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
  }

  const payload = (await response.json()) as OpenAICompletionResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI response content missing.');
  }

  const jsonString = extractJsonObject(content);
  const parsed = JSON.parse(jsonString) as unknown;
  return sanitizeStructuredResponse(parsed);
}
