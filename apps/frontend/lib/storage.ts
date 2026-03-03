export const STORAGE_KEYS = {
  userId: 'commbuilder_user_id',
  proficiencyLevel: 'commbuilder_proficiency_level',
  selectedTopics: 'commbuilder_selected_topics',
  selectedTopic: 'commbuilder_selected_topic',
  onboardingLevel: 'commbuilder_onboarding_level',
} as const;

export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type UserProfile = {
  userId: string;
  proficiencyLevel: ProficiencyLevel;
  selectedTopics: string[];
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function ensureUserId(): string {
  if (!isBrowser()) {
    return '';
  }

  const existing =
    localStorage.getItem(STORAGE_KEYS.userId) ?? sessionStorage.getItem(STORAGE_KEYS.userId);
  if (existing) {
    return existing;
  }

  const userId = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEYS.userId, userId);
  sessionStorage.setItem(STORAGE_KEYS.userId, userId);
  return userId;
}

export function setOnboardingLevel(level: ProficiencyLevel): void {
  if (!isBrowser()) {
    return;
  }
  sessionStorage.setItem(STORAGE_KEYS.onboardingLevel, level);
}

export function getOnboardingLevel(): ProficiencyLevel | null {
  if (!isBrowser()) {
    return null;
  }
  const value = sessionStorage.getItem(STORAGE_KEYS.onboardingLevel);
  if (value === 'Beginner' || value === 'Intermediate' || value === 'Advanced') {
    return value;
  }
  return null;
}

export function setSelectedTopic(topic: string): void {
  if (!isBrowser()) {
    return;
  }
  sessionStorage.setItem(STORAGE_KEYS.selectedTopic, topic);
}

export function getSelectedTopic(): string | null {
  if (!isBrowser()) {
    return null;
  }
  return sessionStorage.getItem(STORAGE_KEYS.selectedTopic);
}

export function saveUserProfile(profile: UserProfile): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(STORAGE_KEYS.userId, profile.userId);
  localStorage.setItem(STORAGE_KEYS.proficiencyLevel, profile.proficiencyLevel);
  localStorage.setItem(STORAGE_KEYS.selectedTopics, JSON.stringify(profile.selectedTopics));

  sessionStorage.setItem(STORAGE_KEYS.userId, profile.userId);
  sessionStorage.setItem(STORAGE_KEYS.proficiencyLevel, profile.proficiencyLevel);
  sessionStorage.setItem(STORAGE_KEYS.selectedTopics, JSON.stringify(profile.selectedTopics));
}

function parseTopics(rawTopics: string | null): string[] {
  if (!rawTopics) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawTopics) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

function parseProficiencyLevel(rawLevel: string | null): ProficiencyLevel | null {
  if (rawLevel === 'Beginner' || rawLevel === 'Intermediate' || rawLevel === 'Advanced') {
    return rawLevel;
  }
  return null;
}

export function getUserProfileFromLocal(): UserProfile | null {
  if (!isBrowser()) {
    return null;
  }

  const userId = localStorage.getItem(STORAGE_KEYS.userId);
  const level = parseProficiencyLevel(localStorage.getItem(STORAGE_KEYS.proficiencyLevel));
  const topics = parseTopics(localStorage.getItem(STORAGE_KEYS.selectedTopics));

  if (!userId || !level || topics.length < 3) {
    return null;
  }

  return {
    userId,
    proficiencyLevel: level,
    selectedTopics: topics,
  };
}

export function getUserProfileFromSession(): UserProfile | null {
  if (!isBrowser()) {
    return null;
  }

  const userId = sessionStorage.getItem(STORAGE_KEYS.userId);
  const level = parseProficiencyLevel(sessionStorage.getItem(STORAGE_KEYS.proficiencyLevel));
  const topics = parseTopics(sessionStorage.getItem(STORAGE_KEYS.selectedTopics));

  if (!userId || !level || topics.length < 3) {
    return null;
  }

  return {
    userId,
    proficiencyLevel: level,
    selectedTopics: topics,
  };
}
