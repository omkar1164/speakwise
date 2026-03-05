function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

type ElevenLabsSttResponse = {
  text?: string;
  transcript?: string;
};

export async function textToSpeech(text: string): Promise<Blob> {
  const normalized = text.trim();
  if (!normalized) {
    throw new Error('Cannot synthesize empty text.');
  }

  const response = await fetch(`${getApiBaseUrl()}/api/elevenlabs/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: normalized,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`TTS request failed: ${response.status} ${errorBody}`);
  }

  return response.blob();
}

export async function speechToText(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');

  const response = await fetch(`${getApiBaseUrl()}/api/elevenlabs/stt`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`STT request failed: ${response.status} ${errorBody}`);
  }

  const payload = (await response.json()) as ElevenLabsSttResponse;
  const text = payload.text ?? payload.transcript ?? '';
  const normalized = text.trim();

  if (!normalized) {
    throw new Error('ElevenLabs STT returned empty transcript.');
  }

  return normalized;
}
