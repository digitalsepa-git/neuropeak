import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameCategory } from '@neuropeak/core';

/**
 * Onboarding cevapları şimdilik cihazda saklanır. PR#5'te Supabase'e
 * senkronize edilecek; anahtar ve şema o zaman da aynı kalacak.
 */
const STORAGE_KEY = 'neuropeak.onboarding.v1';

export const AGE_RANGES = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'] as const;
export type AgeRange = (typeof AGE_RANGES)[number];

export const DAILY_GOALS = [5, 10, 20] as const;
export type DailyGoal = (typeof DAILY_GOALS)[number];

export const CONCERNS = ['forgetfulness', 'distraction', 'slowThinking', 'none'] as const;
export type Concern = (typeof CONCERNS)[number];

export const HABITS = ['daily', 'sometimes', 'rarely', 'never'] as const;
export type Habit = (typeof HABITS)[number];

export type OnboardingAnswers = {
  ageRange: AgeRange | null;
  focusAreas: GameCategory[];
  dailyGoalMinutes: DailyGoal | null;
  concern: Concern | null;
  habit: Habit | null;
  notificationsGranted: boolean;
};

export const EMPTY_ANSWERS: OnboardingAnswers = {
  ageRange: null,
  focusAreas: [],
  dailyGoalMinutes: null,
  concern: null,
  habit: null,
  notificationsGranted: false,
};

type StoredState = {
  completed: boolean;
  completedAt: string | null;
  answers: OnboardingAnswers;
};

/**
 * Okuma başarısız olursa onboarding'i tamamlanmamış sayarız: kullanıcıyı
 * boş bir ana ekrana düşürmektense akışı tekrar göstermek daha iyidir.
 */
export async function loadOnboardingState(): Promise<StoredState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return { completed: false, completedAt: null, answers: EMPTY_ANSWERS };
    }
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return {
      completed: parsed.completed === true,
      completedAt: parsed.completedAt ?? null,
      answers: { ...EMPTY_ANSWERS, ...parsed.answers },
    };
  } catch {
    return { completed: false, completedAt: null, answers: EMPTY_ANSWERS };
  }
}

export async function saveOnboardingResult(answers: OnboardingAnswers): Promise<void> {
  const state: StoredState = {
    completed: true,
    completedAt: new Date().toISOString(),
    answers,
  };
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Depolama yazılamazsa akış yine de ilerler; kullanıcı bir dahaki
    // açılışta onboarding'i tekrar görür.
  }
}

/** Geliştirme sırasında akışı baştan denemek için. */
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // yoksay
  }
}
