'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ExitModal from '@/components/chat/ExitModal';
import MessageBubble from '@/components/chat/MessageBubble';
import MicButton from '@/components/chat/MicButton';
import { STORAGE_KEYS, type ProficiencyLevel } from '@/lib/storage';
import {
  type ChatMessage,
  handleUserAudioTurn,
  startConversation,
} from '@/services/conversation.service';
import type { CorrectionItem } from '@/services/openai.service';

type ChatSessionConfig = {
  userId: string;
  proficiencyLevel: ProficiencyLevel;
  selectedTopic: string;
};

function parseProficiencyLevel(value: string | null): ProficiencyLevel | null {
  if (value === 'Beginner' || value === 'Intermediate' || value === 'Advanced') {
    return value;
  }
  return null;
}

export default function ChatContainer(): JSX.Element {
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [corrections, setCorrections] = useState<CorrectionItem[]>([]);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [lastAssistantAudioBlob, setLastAssistantAudioBlob] = useState<Blob | null>(null);
  const [statusText, setStatusText] = useState<string>('Loading chat session...');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState<number>(0);

  const [sessionConfig, setSessionConfig] = useState<ChatSessionConfig | null>(null);

  const hasStartedConversationRef = useRef<boolean>(false);
  const messagesRef = useRef<ChatMessage[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recorderChunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!sessionId || showExitModal) {
      return;
    }
    const interval = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [sessionId, showExitModal]);

  useEffect(() => {
    const userId = sessionStorage.getItem(STORAGE_KEYS.userId);
    const proficiencyLevel = parseProficiencyLevel(sessionStorage.getItem(STORAGE_KEYS.proficiencyLevel));
    const selectedTopic = sessionStorage.getItem(STORAGE_KEYS.selectedTopic);

    if (!userId || !proficiencyLevel || !selectedTopic) {
      router.replace('/landing');
      return;
    }

    setSessionConfig({
      userId,
      proficiencyLevel,
      selectedTopic,
    });
    setStatusText('Starting conversation...');
  }, [router]);

  const stopAudioPlayback = useCallback((): void => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const playAudioBlob = useCallback(
    async (blob: Blob): Promise<void> => {
      stopAudioPlayback();

      const audioUrl = URL.createObjectURL(blob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsSpeaking(false);
        currentAudioRef.current = null;
      };

      currentAudioRef.current = audio;
      setIsSpeaking(true);

      try {
        await audio.play();
      } catch {
        try {
          await new Promise((resolve) => setTimeout(resolve, 150));
          await audio.play();
        } catch(error) {
          console.error(error);
          setIsSpeaking(false);
          currentAudioRef.current = null;
          setStatusText('Tap the speaker icon below the latest AI message to replay audio.');
        }
      }
    },
    [stopAudioPlayback]
  );

  useEffect(() => {
    if (!sessionConfig || hasStartedConversationRef.current) {
      return;
    }

    hasStartedConversationRef.current = true;

    const run = async (): Promise<void> => {
      try {
        setIsProcessing(true);
        const started = await startConversation(
          sessionConfig.proficiencyLevel,
          sessionConfig.selectedTopic,
          messagesRef.current,
        );
        setSessionId(started.sessionId);
        setMessages(started.memory);
        setCorrections(started.turn.corrections);
        setLastAssistantAudioBlob(started.turn.audioBlob);
        await playAudioBlob(started.turn.audioBlob);
        setStatusText('Your turn: tap mic to speak.');

        if (started.turn.exitDetected) {
          setShowExitModal(true);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to start conversation.';
        setStatusText(message);
      } finally {
        setIsProcessing(false);
      }
    };

    void run();
  }, [playAudioBlob, sessionConfig]);

  useEffect(() => {
    return () => {
      stopAudioPlayback();
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
    };
  }, [stopAudioPlayback]);

  const processRecordedAudio = async (blob: Blob): Promise<void> => {
    if (!sessionConfig || !sessionId) {
      return;
    }

    try {
      setIsProcessing(true);
      setStatusText('Transcribing and generating reply...');
      setMessages((prev) => [
        ...prev,
        {
          id: `user_optimistic_${crypto.randomUUID()}`,
          role: 'user',
          text: 'Processing your message...',
        },
      ]);

      const handled = await handleUserAudioTurn(
        sessionConfig.proficiencyLevel,
        sessionConfig.selectedTopic,
        blob,
        messagesRef.current,
        sessionId,
      );

      setMessages(handled.memory);
      setCorrections(handled.result.assistantTurn.corrections);
      setLastAssistantAudioBlob(handled.result.assistantTurn.audioBlob);
      await playAudioBlob(handled.result.assistantTurn.audioBlob);
      setStatusText('Your turn: tap mic to continue.');

      if (handled.result.assistantTurn.exitDetected) {
        setShowExitModal(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process user audio.';
      setStatusText(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorderChunksRef.current = [];
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          recorderChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(recorderChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        void processRecordedAudio(recordedBlob);
      };

      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setStatusText('Recording... tap mic again to stop.');
    } catch {
      setStatusText('Microphone permission is required to continue.');
    }
  };

  const stopRecording = (): void => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      return;
    }
    recorder.stop();
    setIsRecording(false);
  };

  const handleMicClick = (): void => {
    if (isProcessing || isSpeaking) {
      return;
    }
    if (isRecording) {
      stopRecording();
      return;
    }
    void startRecording();
  };

  const handleReplayLatestAssistantAudio = (): void => {
    if (!lastAssistantAudioBlob) {
      setStatusText('No replay audio available yet.');
      return;
    }
    setStatusText('Replaying latest AI response...');
    void playAudioBlob(lastAssistantAudioBlob);
  };

  const handleExitConfirm = (): void => {
    stopAudioPlayback();

    sessionStorage.removeItem(STORAGE_KEYS.selectedTopic);
    sessionStorage.removeItem(STORAGE_KEYS.selectedTopics);
    sessionStorage.removeItem(STORAGE_KEYS.proficiencyLevel);
    sessionStorage.removeItem(STORAGE_KEYS.userId);
    sessionStorage.removeItem(STORAGE_KEYS.onboardingLevel);

    router.push('/landing');
  };

  const lastAssistantMessage = [...messages].reverse().find((message) => message.role === 'assistant');
  const lastAssistantMessageId = lastAssistantMessage?.id ?? null;
  const micDisabled = isProcessing || isSpeaking || showExitModal || !sessionId;
  const minutes = Math.floor(elapsedSec / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (elapsedSec % 60).toString().padStart(2, '0');

  return (
    <>
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
        <header className="mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Topic</p>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">
            {sessionConfig?.selectedTopic ?? '...'}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{statusText}</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">Session timer: {minutes}:{seconds}</p>
          {isSpeaking && (
            <div className="mt-2 flex items-center gap-1" aria-label="AI speaking waveform">
              <span className="h-2 w-1 animate-pulse rounded bg-blue-500" />
              <span className="h-3 w-1 animate-pulse rounded bg-blue-500 [animation-delay:100ms]" />
              <span className="h-4 w-1 animate-pulse rounded bg-blue-500 [animation-delay:200ms]" />
              <span className="h-3 w-1 animate-pulse rounded bg-blue-500 [animation-delay:300ms]" />
            </div>
          )}
        </header>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-white/40 p-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              showReplay={message.role === 'assistant' && message.id === lastAssistantMessageId}
              replayDisabled={!lastAssistantAudioBlob || isProcessing}
              onReplay={handleReplayLatestAssistantAudio}
            />
          ))}
        </div>

        <footer className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <button
            type="button"
            onClick={() => setShowExitModal(true)}
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)]"
          >
            Exit chat
          </button>

          <MicButton onClick={handleMicClick} isRecording={isRecording} disabled={micDisabled} />
        </footer>
        {corrections.length > 0 && (
          <p className="mt-2 text-right text-xs text-[var(--color-muted)]">
            {corrections.length} correction{corrections.length > 1 ? 's' : ''} available in your last answer.
          </p>
        )}
      </section>

      <ExitModal
        isOpen={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={handleExitConfirm}
      />
    </>
  );
}
