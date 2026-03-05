const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'actually'] as const;

export function countWords(text: string): number {
  const normalized = text.trim();
  if (!normalized) {
    return 0;
  }
  return normalized.split(/\s+/).length;
}

export function detectFillerWords(text: string): number {
  const normalized = text.toLowerCase();
  return FILLER_WORDS.reduce((acc, phrase) => {
    const regex = new RegExp(`\\b${phrase.replace(/\s+/g, '\\s+')}\\b`, 'g');
    const count = normalized.match(regex)?.length ?? 0;
    return acc + count;
  }, 0);
}

export function calculateWPM(wordCount: number, durationSec: number): number {
  if (durationSec <= 0) {
    return 0;
  }
  return (wordCount / durationSec) * 60;
}

export function calculateVocabularyDiversity(text: string): number {
  const words = text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  if (words.length === 0) {
    return 0;
  }

  const unique = new Set(words);
  return unique.size / words.length;
}

export function calculateGrammarErrorRate(errors: number, wordCount: number): number {
  if (wordCount === 0) {
    return 0;
  }
  return errors / wordCount;
}
