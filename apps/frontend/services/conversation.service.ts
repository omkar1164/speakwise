import type { ProficiencyLevel } from '@/lib/storage';
import { speechToText, textToSpeech } from '@/services/elevenlabs.service';
import {
  type CorrectionItem,
  type OpenAIChatMessage,
  generateReply,
} from '@/services/openai.service';

export type ChatRole = 'assistant' | 'user';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  corrections?: CorrectionItem[];
};

export type ConversationTurnResult = {
  assistantMessage: ChatMessage;
  audioBlob: Blob;
  corrections: CorrectionItem[];
  exitDetected: boolean;
};

export type UserTurnResult = {
  userMessage: ChatMessage;
  assistantTurn: ConversationTurnResult;
};

const EXIT_PHRASES = ['i want to stop', 'end conversation', "that's all for today"];

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function buildBasePrompt(proficiencyLevel: ProficiencyLevel, topic: string): string {
  const levelInstruction =
    proficiencyLevel === 'Beginner'
      ? 'Use very simple vocabulary and short sentences.'
      : proficiencyLevel === 'Intermediate'
        ? 'Use common everyday vocabulary with moderate sentence complexity.'
        : 'Use natural fluent English with concise phrasing.';

  return [
    'You are a supportive spoken-English coach in a voice-first app.',
    'Style: confidence-first, encouraging, concise.',
    'Always praise before correction.',
    'Do not overwhelm the learner; keep corrections selective and practical.',
    'Keep the conversation focused on the current topic.',
    'Ask one clear follow-up question each turn.',
    levelInstruction,
    `Current topic: ${topic}.`,
  ].join('\n');
}

function toOpenAIMessages(memory: ChatMessage[], basePrompt: string): OpenAIChatMessage[] {
  const converted: OpenAIChatMessage[] = [{ role: 'system', content: basePrompt }];
  for (const message of memory) {
    converted.push({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.text,
    });
  }
  return converted;
}

export function detectExitIntent(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return EXIT_PHRASES.some((phrase) => normalized.includes(phrase));
}

export async function startConversation(
  proficiencyLevel: ProficiencyLevel,
  topic: string,
  memory: ChatMessage[]
): Promise<{ memory: ChatMessage[]; turn: ConversationTurnResult }> {
  const basePrompt = buildBasePrompt(proficiencyLevel, topic);
  const openAiMessages = toOpenAIMessages(memory, basePrompt);
  openAiMessages.push({
    role: 'user',
    content: `Start the session now. Greet me, introduce "${topic}", and ask the first question.`,
  });

  const structured = await generateReply(openAiMessages, proficiencyLevel);
  const assistantMessage: ChatMessage = {
    id: createId('assistant'),
    role: 'assistant',
    text: structured.reply,
  };
  const audioBlob = await textToSpeech(structured.reply);
  const nextMemory = [...memory, assistantMessage];

  return {
    memory: nextMemory,
    turn: {
      assistantMessage,
      audioBlob,
      corrections: [],
      exitDetected: structured.exitDetected,
    },
  };
}

export async function handleUserAudioTurn(
  proficiencyLevel: ProficiencyLevel,
  topic: string,
  audioBlob: Blob,
  memory: ChatMessage[]
): Promise<{ memory: ChatMessage[]; result: UserTurnResult }> {
  const userText = await speechToText(audioBlob);
  const userMessage: ChatMessage = {
    id: createId('user'),
    role: 'user',
    text: userText,
  };

  const withUserMemory = [...memory, userMessage];
  const basePrompt = buildBasePrompt(proficiencyLevel, topic);
  const openAiMessages = toOpenAIMessages(withUserMemory, basePrompt);

  const previousAssistant = [...memory].reverse().find((message) => message.role === 'assistant');
  const correctionInstruction: OpenAIChatMessage = {
    role: 'system',
    content: [
      'Correction mode: confidence-first tone.',
      'Use the previous AI question and current user answer.',
      `Previous AI question: ${previousAssistant?.text ?? 'N/A'}`,
      `User answer: ${userText}`,
      'If user asks to stop/end, set exitDetected=true.',
    ].join('\n'),
  };
  openAiMessages.push(correctionInstruction);

  const structured = await generateReply(openAiMessages, proficiencyLevel);
  const localExitDetected = detectExitIntent(userText);
  const exitDetected = structured.exitDetected || localExitDetected;

  const assistantMessage: ChatMessage = {
    id: createId('assistant'),
    role: 'assistant',
    text: structured.reply,
  };
  const answerCorrections = structured.corrections;

  userMessage.corrections = answerCorrections;
  const finalMemory = [...withUserMemory, assistantMessage];
  const replyAudio = await textToSpeech(structured.reply);

  return {
    memory: finalMemory,
    result: {
      userMessage,
      assistantTurn: {
        assistantMessage,
        audioBlob: replyAudio,
        corrections: answerCorrections,
        exitDetected,
      },
    },
  };
}
