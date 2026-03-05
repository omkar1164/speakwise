import type { ProficiencyLevel } from '@/lib/storage';
import { sendMessage, speechToText, startSession, textToSpeech } from '@/services/api.service';
import type { ChatMessage, CorrectionItem } from '@/services/api.service';

export type { ChatMessage, CorrectionItem };

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

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function toBackendLevel(level: ProficiencyLevel): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
  if (level === 'Beginner') {
    return 'BEGINNER';
  }
  if (level === 'Intermediate') {
    return 'INTERMEDIATE';
  }
  return 'ADVANCED';
}

export async function startConversation(
  proficiencyLevel: ProficiencyLevel,
  topic: string,
  memory: ChatMessage[],
): Promise<{ memory: ChatMessage[]; turn: ConversationTurnResult; sessionId: string }> {
  const session = await startSession(topic);
  const firstTurn = await sendMessage(
    session.id,
    `Start the session now. Greet me, introduce "${topic}", and ask the first question.`,
    toBackendLevel(proficiencyLevel),
  );

  const assistantMessage: ChatMessage = {
    id: createId('assistant'),
    role: 'assistant',
    text: firstTurn.ai.reply,
  };
  const audioBlob = await textToSpeech(firstTurn.ai.reply);

  return {
    memory: [...memory, assistantMessage],
    sessionId: session.id,
    turn: {
      assistantMessage,
      audioBlob,
      corrections: firstTurn.ai.corrections,
      exitDetected: firstTurn.ai.exitDetected,
    },
  };
}

export async function handleUserAudioTurn(
  proficiencyLevel: ProficiencyLevel,
  _topic: string,
  audioBlob: Blob,
  memory: ChatMessage[],
  sessionId: string,
): Promise<{ memory: ChatMessage[]; result: UserTurnResult }> {
  const userText = await speechToText(audioBlob);
  const userMessage: ChatMessage = {
    id: createId('user'),
    role: 'user',
    text: userText,
  };

  const aiResult = await sendMessage(sessionId, userText, toBackendLevel(proficiencyLevel));

  const assistantMessage: ChatMessage = {
    id: createId('assistant'),
    role: 'assistant',
    text: aiResult.ai.reply,
  };

  userMessage.corrections = aiResult.ai.corrections;
  const finalMemory = [...memory, userMessage, assistantMessage];
  const replyAudio = await textToSpeech(aiResult.ai.reply);

  return {
    memory: finalMemory,
    result: {
      userMessage,
      assistantTurn: {
        assistantMessage,
        audioBlob: replyAudio,
        corrections: aiResult.ai.corrections,
        exitDetected: aiResult.ai.exitDetected,
      },
    },
  };
}
