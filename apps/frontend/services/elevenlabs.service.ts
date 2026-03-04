function getElevenLabsApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_ELEVENLABS_API_KEY.');
  }
  return apiKey;
}

const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';
const ELEVENLABS_STT_ENDPOINT = 'https://api.elevenlabs.io/v1/speech-to-text';

type ElevenLabsSttResponse = {
  text?: string;
  transcript?: string;
};

export async function textToSpeech(text: string): Promise<Blob> {
  const normalized = text.trim();
  if (!normalized) {
    throw new Error('Cannot synthesize empty text.');
  }

  const apiKey = getElevenLabsApiKey();
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: normalized,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ElevenLabs request failed: ${response.status} ${errorBody}`);
  }

  return response.blob();
}

export async function speechToText(audioBlob: Blob): Promise<string> {
  const apiKey = getElevenLabsApiKey();
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model_id', 'scribe_v1');

  const response = await fetch(ELEVENLABS_STT_ENDPOINT, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ElevenLabs STT request failed: ${response.status} ${errorBody}`);
  }

  const payload = (await response.json()) as ElevenLabsSttResponse;
  const text = payload.text ?? payload.transcript ?? '';
  const normalized = text.trim();

  if (!normalized) {
    throw new Error('ElevenLabs STT returned empty transcript.');
  }

  return normalized;
}
