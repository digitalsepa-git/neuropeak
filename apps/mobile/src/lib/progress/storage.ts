import AsyncStorage from '@react-native-async-storage/async-storage';
import { EMPTY_STREAK, type DailyTask, type StreakState } from '@neuropeak/core';

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
};

export const EMPTY_PROGRESS: ProgressState = {
  xp: 0,
  stars: 0,
  streak: EMPTY_STREAK,
  tasksDate: null,
  tasks: [],
  rewardedAdsToday: 0,
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
