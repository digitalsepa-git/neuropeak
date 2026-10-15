import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  dueItems,
  enqueue as enqueueItem,
  markFailed,
  markSucceeded,
  type NewOutboxItem,
  type OutboxItem,
  type StreakState,
} from '@neuropeak/core';

import type { OnboardingAnswers } from '../onboarding';
import type { StoredTestResult } from '../test-results';
import { getUserId } from '../session';
import { isSupabaseConfigured, supabase } from '../supabase';

const QUEUE_KEY = 'neuropeak.outbox.v1';

/**
 * Senkronize edilecek değişiklik türleri. Yeni bir tür eklemek için buraya
 * bir varyant ve aşağıdaki `send` içine bir dal eklemek yeterli.
 */
export type Mutation =
  | {
      kind: 'onboarding_upsert';
      payload: OnboardingAnswers;
      dedupeKey: 'self';
    }
  | {
      // Her test sonucu ayrı satır; tekilleştirilmez.
      kind: 'test_result';
      payload: StoredTestResult;
      dedupeKey?: undefined;
    }
  | {
      kind: 'progress_upsert';
      payload: { xp: number; level: number; streak: StreakState };
      dedupeKey: 'self';
    };

let queue: OutboxItem[] = [];
let loaded = false;
let flushing = false;

async function loadQueue(): Promise<void> {
  if (loaded) return;
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    queue = raw === null ? [] : (JSON.parse(raw) as OutboxItem[]);
  } catch {
    queue = [];
  }
  loaded = true;
}

async function persistQueue(): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Kuyruk yazılamazsa bellekte kalır; bu açılışta yine de gönderilmeye
    // çalışılır, sonraki açılışta kaybolur. Kullanıcıya yansıyan bir şey yok.
  }
}

/** Değişikliği kuyruğa alır ve hemen göndermeyi dener. */
export async function enqueueMutation(mutation: Mutation): Promise<void> {
  await loadQueue();

  const item: NewOutboxItem = {
    id: `${mutation.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind: mutation.kind,
    payload: mutation.payload,
    ...(mutation.dedupeKey !== undefined && { dedupeKey: mutation.dedupeKey }),
  };

  queue = enqueueItem(queue, item, Date.now());
  await persistQueue();
  await flushOutbox();
}

async function send(item: OutboxItem, userId: string): Promise<void> {
  if (supabase === null) {
    throw new Error('Supabase yapılandırılmamış');
  }

  switch (item.kind) {
    case 'onboarding_upsert': {
      const answers = item.payload as OnboardingAnswers;
      const { error } = await supabase.from('onboarding_answers').upsert(
        {
          user_id: userId,
          age_range: answers.ageRange,
          focus_areas: answers.focusAreas,
          daily_goal_minutes: answers.dailyGoalMinutes,
          concern: answers.concern,
          habit: answers.habit,
          notifications_granted: answers.notificationsGranted,
        },
        { onConflict: 'user_id' },
      );
      if (error !== null) {
        throw new Error(error.message);
      }
      return;
    }
    case 'test_result': {
      const result = item.payload as StoredTestResult;
      const { error } = await supabase.from('test_results').insert({
        user_id: userId,
        test_id: result.testId,
        raw_score: result.score.rawScore,
        iq_score: result.score.iq,
        percentile: result.score.percentile,
        correct_count: result.score.correctCount,
        answered_count: result.score.answeredCount,
        subscores: result.score.subscores,
        duration_ms: result.score.durationMs,
        created_at: result.completedAt,
      });
      if (error !== null) {
        throw new Error(error.message);
      }
      return;
    }
    case 'progress_upsert': {
      const progress = item.payload as { xp: number; level: number; streak: StreakState };

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ xp: progress.xp, level: progress.level })
        .eq('id', userId);
      if (profileError !== null) {
        throw new Error(profileError.message);
      }

      const { error: streakError } = await supabase.from('streaks').upsert(
        {
          user_id: userId,
          current_days: progress.streak.currentDays,
          longest_days: progress.streak.longestDays,
          last_active_date: progress.streak.lastActiveDate,
          freezes_left: progress.streak.freezesLeft,
        },
        { onConflict: 'user_id' },
      );
      if (streakError !== null) {
        throw new Error(streakError.message);
      }
      return;
    }
    default:
      // Tanınmayan tür eski bir sürümden kalmış olabilir; kuyruğu tıkamasın.
      return;
  }
}

/**
 * Bekleyen değişiklikleri gönderir. Supabase yapılandırılmamışsa veya
 * oturum yoksa kuyruk olduğu gibi kalır — uygulama çevrimdışı çalışmaya
 * devam eder, veriler bir sonraki fırsatta gider.
 */
export async function flushOutbox(): Promise<void> {
  if (flushing || !isSupabaseConfigured) return;

  flushing = true;
  try {
    await loadQueue();
    if (queue.length === 0) return;

    const userId = await getUserId();
    if (userId === null) return;

    for (const item of dueItems(queue, Date.now())) {
      try {
        await send(item, userId);
        queue = markSucceeded(queue, item.id);
      } catch {
        queue = markFailed(queue, item.id, Date.now());
      }
    }

    await persistQueue();
  } finally {
    flushing = false;
  }
}

/** Bekleyen değişiklik sayısı — geliştirme ve tanılama için. */
export async function pendingMutationCount(): Promise<number> {
  await loadQueue();
  return queue.length;
}
