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

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
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

export async function generateReply(
  messages: OpenAIChatMessage[],
  proficiencyLevel: ProficiencyLevel
): Promise<StructuredAssistantResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/openai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      proficiencyLevel,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Chat request failed: ${response.status} ${errorBody}`);
  }

  const payload = (await response.json()) as unknown;
  return sanitizeStructuredResponse(payload);
}
