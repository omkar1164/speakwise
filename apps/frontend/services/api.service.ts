'use client';

export type CorrectionItem = {
  incorrect: string;
  corrected: string;
  explanation: string;
};

export type AiResponse = {
  reply: string;
  corrections: CorrectionItem[];
  analytics: {
    grammarErrors: number;
    complexityScore: number;
  };
  exitDetected: boolean;
  tokenUsage: number;
};

export type ChatRole = 'assistant' | 'user';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  corrections?: CorrectionItem[];
};

export type StartSessionResponse = {
  id: string;
  topic: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function getToken(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return sessionStorage.getItem('commbuilder_auth_token') ?? '';
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}

export function startSession(topic: string): Promise<StartSessionResponse> {
  return request<StartSessionResponse>('/sessions', {
    method: 'POST',
    body: JSON.stringify({ topic }),
  });
}

export function sendMessage(
  sessionId: string,
  content: string,
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
): Promise<{ sessionId: string; ai: AiResponse }> {
  return request<{ sessionId: string; ai: AiResponse }>(`/sessions/${sessionId}/message`, {
    method: 'POST',
    body: JSON.stringify({ content, proficiencyLevel }),
  });
}

export async function speechToText(audioBlob: Blob): Promise<string> {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const audioBase64 = btoa(binary);

  const result = await request<{ transcript: string }>('/ai/stt', {
    method: 'POST',
    body: JSON.stringify({ audioBase64 }),
  });
  return result.transcript;
}

export async function textToSpeech(text: string): Promise<Blob> {
  const result = await request<{ audioBase64: string }>('/ai/tts', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });

  const binary = atob(result.audioBase64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: 'audio/mpeg' });
}
