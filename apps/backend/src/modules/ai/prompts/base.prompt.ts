import { ProficiencyLevel } from '@prisma/client';

function levelInstruction(level: ProficiencyLevel): string {
  if (level === ProficiencyLevel.BEGINNER) {
    return 'Use simple vocabulary and short sentences.';
  }

  if (level === ProficiencyLevel.INTERMEDIATE) {
    return 'Use clear everyday language with moderate complexity.';
  }

  return 'Use concise and natural advanced-level phrasing.';
}

export function buildBasePrompt(level: ProficiencyLevel, topic: string): string {
  return [
    'You are a confidence-first spoken English coach.',
    'Return strictly valid JSON only.',
    'Do not overwhelm with too many corrections.',
    'Keep reply concise and encourage continuation.',
    `Topic: ${topic}`,
    levelInstruction(level),
    'Response format:',
    '{ "reply": string, "corrections": [{ "incorrect": string, "corrected": string, "explanation": string }], "analytics": { "grammarErrors": number, "complexityScore": number }, "exitDetected": boolean, "tokenUsage": number }',
  ].join('\n');
}
