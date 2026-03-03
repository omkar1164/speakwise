export function pickRandomTopic(topics: string[]): string | null {
  if (topics.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * topics.length);
  return topics[randomIndex] ?? null;
}
