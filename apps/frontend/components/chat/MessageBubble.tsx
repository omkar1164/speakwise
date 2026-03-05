'use client';

import CorrectionTooltip from '@/components/chat/CorrectionTooltip';
import type { ChatMessage } from '@/services/conversation.service';
import type { CorrectionItem } from '@/services/openai.service';

type MessageBubbleProps = {
  message: ChatMessage;
  showReplay?: boolean;
  replayDisabled?: boolean;
  onReplay?: () => void;
};

type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'correction'; correction: CorrectionItem };

function toSegments(messageText: string, corrections: CorrectionItem[]): Segment[] {
  if (corrections.length === 0) {
    return [{ kind: 'text', value: messageText }];
  }

  const normalizedText = messageText;
  const segments: Segment[] = [];
  let cursor = 0;

  for (const correction of corrections) {
    const target = correction.incorrect;
    if (!target) {
      continue;
    }

    const index = normalizedText.toLowerCase().indexOf(target.toLowerCase(), cursor);
    if (index === -1) {
      continue;
    }

    if (index > cursor) {
      segments.push({ kind: 'text', value: normalizedText.slice(cursor, index) });
    }

    segments.push({ kind: 'correction', correction });
    cursor = index + target.length;
  }

  if (cursor < normalizedText.length) {
    segments.push({ kind: 'text', value: normalizedText.slice(cursor) });
  }

  return segments.length > 0 ? segments : [{ kind: 'text', value: messageText }];
}

export default function MessageBubble({
  message,
  showReplay = false,
  replayDisabled = false,
  onReplay,
}: MessageBubbleProps): JSX.Element {
  const isAssistant = message.role === 'assistant';
  const bubbleClass = isAssistant
    ? 'self-start bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
    : 'self-end bg-blue-600 text-white';

  const corrections = message.corrections ?? [];
  const segments = toSegments(message.text, corrections);

  return (
    <article
      className={`max-w-[85%] animate-[fadeIn_220ms_ease-out] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${bubbleClass}`}
    >
      {isAssistant ? (
        <div>
          <p>{message.text}</p>
          {showReplay && onReplay && (
            <button
              type="button"
              onClick={onReplay}
              disabled={replayDisabled}
              aria-label="Replay assistant audio"
              title="Replay assistant audio"
              className="mt-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M3 10v4h4l5 4V6L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.25-3.9v7.8A4.5 4.5 0 0 0 16.5 12zm0-9v2.06A9 9 0 0 1 18 21h-1.5a7.5 7.5 0 0 0 0-15V3z" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <p>
          {segments.map((segment, index) => {
            if (segment.kind === 'text') {
              return <span key={`txt_${index}`}>{segment.value}</span>;
            }
            return (
              <CorrectionTooltip
                key={`corr_${index}_${segment.correction.incorrect}`}
                correction={segment.correction}
              />
            );
          })}
        </p>
      )}
    </article>
  );
}
