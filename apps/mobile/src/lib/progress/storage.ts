import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  EMPTY_BRAIN_MAP,
  EMPTY_STREAK,
  type BrainMap,
  type CategoryCounts,
  type DailyTask,
  type DayActivity,
  type LeagueOutcome,
  type LeagueTier,
  type StreakState,
} from '@neuropeak/core';

const STATE_KEY = 'neuropeak.progress.v1';
const DEVICE_ID_KEY = 'neuropeak.deviceId';

export type ProgressState = {
  xp: number;
  stars: number;
  streak: StreakState;
  /** Görevlerin ait olduğu gün; farklıysa yeni görevler seçilir. */
  tasksDate: string | null;
  tasks: DailyTask[];
  /** Bugün ödüllü reklamla kazanılan yıldız sayısı. */
  rewardedAdsToday: number;
  /** Beş eksendeki güncel performans; İlerleme sekmesini besler. */
  brainMap: BrainMap;
  /** Son iki haftanın günlük XP ve tur sayısı. */
  history: DayActivity[];
  /** Kategori başına oynanan tur sayısı. */
  categoryRounds: CategoryCounts;
  league: LeagueState;
};

export type LeagueState = {
  tier: LeagueTier;
  /** İçinde bulunulan haftanın pazartesisi. */
  weekStart: string | null;
  /** Bu hafta kazanılan XP; lig sıralaması buna bakar. */
  weeklyXp: number;
  /** Geçen haftanın sonucu; hafta başında bir kez gösterilir. */
  lastResult: { tier: LeagueTier; rank: number; outcome: LeagueOutcome } | null;
};

export const EMPTY_LEAGUE: LeagueState = {
  tier: 'bronze',
  weekStart: null,
  weeklyXp: 0,
  lastResult: null,
};

export const EMPTY_PROGRESS: ProgressState = {
  xp: 0,
  stars: 0,
  streak: EMPTY_STREAK,
  tasksDate: null,
  tasks: [],
  rewardedAdsToday: 0,
  brainMap: EMPTY_BRAIN_MAP,
  history: [],
  categoryRounds: {},
  league: EMPTY_LEAGUE,
};

export async function loadProgress(): Promise<ProgressState> {
  try {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    if (raw === null) return EMPTY_PROGRESS;

    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      ...EMPTY_PROGRESS,
      ...parsed,
      streak: { ...EMPTY_STREAK, ...parsed.streak },
      tasks: parsed.tasks ?? [],
      brainMap: { ...EMPTY_BRAIN_MAP, ...parsed.brainMap },
      history: parsed.history ?? [],
      categoryRounds: parsed.categoryRounds ?? {},
      league: { ...EMPTY_LEAGUE, ...parsed.league },
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export async function saveProgress(state: ProgressState): Promise<void> {
  try {
    await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // Yazılamazsa oturum içinde doğru çalışmaya devam eder; bir sonraki
    // açılışta son kaydedilen hâle döner.
  }
}

/**
 * Günlük görev seçimini tohumlamak için kalıcı bir kimlik. Supabase
 * oturumundan bağımsız: hesap olmadan da görevler tutarlı kalsın.
 */
export async function getDeviceId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existing !== null) return existing;

    const created = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, created);
    return created;
  } catch {
    return 'anonymous';
  }
}
