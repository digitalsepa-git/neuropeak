import {
  STAR_REWARDS,
  applyTaskEvent,
  levelProgress,
  pickDailyTasks,
  recordActivity,
  toDateKey,
  xpForGameRound,
  xpForTestCompletion,
  type Difficulty,
  type GameCategory,
  type LevelProgress,
  type TaskEvent,
} from '@neuropeak/core';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { enqueueMutation } from '@/lib/sync';

import {
  EMPTY_PROGRESS,
  getDeviceId,
  loadProgress,
  saveProgress,
  type ProgressState,
} from './storage';
import { DAILY_TASK_TEMPLATES } from './templates';

/** Kutlanacak olay; arayüz gösterdikten sonra temizler. */
export type Celebration =
  | { type: 'level_up'; level: number }
  | { type: 'streak'; days: number }
  | { type: 'tasks_done'; stars: number };

type ProgressContextValue = {
  readonly state: ProgressState;
  readonly level: LevelProgress;
  readonly ready: boolean;
  readonly celebration: Celebration | null;
  clearCelebration: () => void;
  recordGameRound: (options: {
    category: GameCategory;
    difficulty: Difficulty;
    completed: boolean;
    baseXp?: number;
  }) => Promise<void>;
  recordTestFinished: (iq: number) => Promise<void>;
  spendStars: (amount: number) => Promise<boolean>;
};

const noop = async () => undefined;

const ProgressContext = createContext<ProgressContextValue>({
  state: EMPTY_PROGRESS,
  level: levelProgress(0),
  ready: false,
  celebration: null,
  clearCelebration: () => undefined,
  recordGameRound: noop,
  recordTestFinished: noop,
  spendStars: () => Promise.resolve(false),
});

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(EMPTY_PROGRESS);
  const [ready, setReady] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);

  // Hesaplamalar güncel durumu okumalı ama setState güncelleyicisi saf
  // kalmalı; bu yüzden durum ayrıca bir ref'te tutuluyor.
  const stateRef = useRef<ProgressState>(EMPTY_PROGRESS);
  const deviceId = useRef<string>('anonymous');

  const commit = useCallback(async (next: ProgressState) => {
    stateRef.current = next;
    setState(next);
    await saveProgress(next);
    await enqueueMutation({
      kind: 'progress_upsert',
      payload: { xp: next.xp, level: levelProgress(next.xp).level, streak: next.streak },
      dedupeKey: 'self',
    });
  }, []);

  useEffect(() => {
    async function bootstrap() {
      deviceId.current = await getDeviceId();
      const stored = await loadProgress();
      const today = toDateKey(new Date());

      // Gün değiştiyse görevler yenilenir ve reklam sayacı sıfırlanır.
      const refreshed: ProgressState =
        stored.tasksDate === today
          ? stored
          : {
              ...stored,
              tasksDate: today,
              tasks: pickDailyTasks(DAILY_TASK_TEMPLATES, deviceId.current, today),
              rewardedAdsToday: 0,
            };

      stateRef.current = refreshed;
      setState(refreshed);
      setReady(true);

      if (refreshed !== stored) {
        await saveProgress(refreshed);
      }
    }

    void bootstrap();
  }, []);

  /**
   * Bir etkinliği bütün sistemlere işler: XP, seri, günlük görevler ve
   * yıldızlar. Tek kapıdan geçmesi, bir ödülün unutulmasını engelliyor.
   */
  const applyActivity = useCallback(
    async (options: { xpGain: number; starGain: number; taskEvents: TaskEvent[] }) => {
      const current = stateRef.current;
      const today = toDateKey(new Date());

      const previousLevel = levelProgress(current.xp).level;
      const xp = current.xp + options.xpGain;
      const nextLevel = levelProgress(xp).level;
      const leveledUp = nextLevel > previousLevel;

      const streakOutcome = recordActivity(current.streak, today);

      let tasks = current.tasks;
      let taskStars = 0;
      let completedAny = false;

      // Kazanılan XP de bir görev olayıdır; görev ödülü olarak gelen
      // yıldızlar XP görevini etkilemesin diye olaylar tek seferde geçer.
      const events: TaskEvent[] = [
        ...options.taskEvents,
        { type: 'xp_earned', amount: options.xpGain },
      ];

      for (const event of events) {
        const result = applyTaskEvent(tasks, event);
        tasks = result.tasks;
        for (const finished of result.justCompleted) {
          taskStars += finished.starReward;
          completedAny = true;
        }
      }

      const stars =
        current.stars + options.starGain + taskStars + (leveledUp ? STAR_REWARDS.levelUp : 0);

      // Kutlama önceliği: seviye atlama > seri eşiği > görev bitirme.
      if (leveledUp) {
        setCelebration({ type: 'level_up', level: nextLevel });
      } else if (streakOutcome.milestone !== null) {
        setCelebration({ type: 'streak', days: streakOutcome.milestone });
      } else if (completedAny) {
        setCelebration({ type: 'tasks_done', stars: taskStars });
      }

      await commit({
        ...current,
        xp,
        stars,
        streak: streakOutcome.state,
        tasksDate: today,
        tasks,
      });
    },
    [commit],
  );

  const recordGameRound = useCallback<ProgressContextValue['recordGameRound']>(
    async (options) => {
      await applyActivity({
        xpGain: xpForGameRound(options),
        starGain: options.completed ? STAR_REWARDS.gameComplete : 0,
        taskEvents: [{ type: 'game_played', category: options.category }],
      });
    },
    [applyActivity],
  );

  const recordTestFinished = useCallback<ProgressContextValue['recordTestFinished']>(
    async (iq) => {
      await applyActivity({
        xpGain: xpForTestCompletion(iq),
        starGain: STAR_REWARDS.testComplete,
        taskEvents: [{ type: 'test_finished' }],
      });
    },
    [applyActivity],
  );

  const spendStars = useCallback<ProgressContextValue['spendStars']>(
    async (amount) => {
      const current = stateRef.current;
      if (current.stars < amount) return false;
      await commit({ ...current, stars: current.stars - amount });
      return true;
    },
    [commit],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      level: levelProgress(state.xp),
      ready,
      celebration,
      clearCelebration: () => setCelebration(null),
      recordGameRound,
      recordTestFinished,
      spendStars,
    }),
    [celebration, ready, recordGameRound, recordTestFinished, spendStars, state],
  );

  return <ProgressContext value={value}>{children}</ProgressContext>;
}

export function useProgress(): ProgressContextValue {
  return use(ProgressContext);
}
