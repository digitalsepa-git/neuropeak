import {
  STAR_REWARDS,
  applyRoundToBrainMap,
  applyTaskEvent,
  levelProgress,
  neuropeakScore,
  pickDailyTasks,
  recordActivity,
  recordCategoryRound,
  LEAGUE_TIERS,
  newlyEarnedBadges,
  recordDayActivity,
  roundPerformance,
  starsForBadges,
  toDateKey,
  xpForGameRound,
  xpForTestCompletion,
  type BrainMap,
  type Difficulty,
  type GameCategory,
  type GameMode,
  type BadgeContext,
  type LeagueTier,
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

import { BADGES, type ContentBadge } from '@neuropeak/content';

import { rolloverLeague } from './league';
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
  | { type: 'tasks_done'; stars: number }
  | { type: 'badge'; title: string; count: number; stars: number };

type ProgressContextValue = {
  readonly state: ProgressState;
  readonly level: LevelProgress;
  readonly ready: boolean;
  readonly celebration: Celebration | null;
  clearCelebration: () => void;
  readonly neuropeak: number;
  /** Lig grubunu tohumlayan kalıcı kimlik. */
  readonly userId: string;
  recordGameRound: (options: {
    category: GameCategory;
    difficulty: Difficulty;
    completed: boolean;
    baseXp?: number;
    /** Beyin haritası için: oyunun yapısı ve ulaşılan seviye. */
    mode: GameMode;
    level: number;
  }) => Promise<void>;
  recordTestFinished: (iq: number) => Promise<void>;
  /** Rozet vitrini için tanımlar; içerik paketinden geliyor. */
  readonly badges: readonly ContentBadge[];
  spendStars: (amount: number) => Promise<boolean>;
  /** Ödüllü reklam sonuna kadar izlendiğinde çağrılır. */
  grantRewardedAdStars: () => Promise<void>;
};

const noop = async () => undefined;

/** İki kademeden yüksek olanı; düşünce rozet geri alınmasın diye. */
function betterTier(a: LeagueTier, b: LeagueTier): LeagueTier {
  return LEAGUE_TIERS.indexOf(a) >= LEAGUE_TIERS.indexOf(b) ? a : b;
}

const ProgressContext = createContext<ProgressContextValue>({
  state: EMPTY_PROGRESS,
  level: levelProgress(0),
  neuropeak: neuropeakScore(EMPTY_PROGRESS.brainMap),
  userId: 'anonymous',
  badges: BADGES,
  ready: false,
  celebration: null,
  clearCelebration: () => undefined,
  recordGameRound: noop,
  recordTestFinished: noop,
  spendStars: () => Promise.resolve(false),
  grantRewardedAdStars: noop,
});

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(EMPTY_PROGRESS);
  const [ready, setReady] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  // Kimlik render sırasında okunduğu için ref değil state; ref'i render
  // içinde okumak React Compiler'ın haklı olarak yasakladığı bir şey.
  const [userId, setUserId] = useState('anonymous');

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
      setUserId(deviceId.current);
      const stored = await loadProgress();
      const now = new Date();
      const today = toDateKey(now);
      const league = rolloverLeague(stored.league, now, deviceId.current);

      // Gün değiştiyse görevler yenilenir ve reklam sayacı sıfırlanır.
      const withLeague: ProgressState = league === stored.league ? stored : { ...stored, league };

      const refreshed: ProgressState =
        withLeague.tasksDate === today
          ? withLeague
          : {
              ...withLeague,
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
    async (options: {
      xpGain: number;
      starGain: number;
      taskEvents: TaskEvent[];
      /** Oyun turuysa beyin haritasına işlenecek bilgi. */
      round?: { category: GameCategory; performance: number };
      /** Test tamamlandıysa alınan skor. */
      testIq?: number;
    }) => {
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

      const brainMap: BrainMap =
        options.round === undefined
          ? current.brainMap
          : applyRoundToBrainMap(
              current.brainMap,
              options.round.category,
              options.round.performance,
            );

      const categoryRounds =
        options.round === undefined
          ? current.categoryRounds
          : recordCategoryRound(current.categoryRounds, options.round.category);

      const weeklyXp = current.league.weeklyXp + options.xpGain;
      const league = {
        ...current.league,
        weeklyXp,
        bestWeeklyXp: Math.max(current.league.bestWeeklyXp, weeklyXp),
        bestTier: betterTier(current.league.bestTier, current.league.tier),
      };

      const testsFinished = current.testsFinished + (options.testIq === undefined ? 0 : 1);
      const bestIq = Math.max(current.bestIq, options.testIq ?? 0);

      // Rozetler en son bakılıyor: koşulları bu etkinlikten sonraki
      // duruma göre değerlendirilmeli, önceki duruma göre değil.
      const badgeContext: BadgeContext = {
        level: nextLevel,
        xp,
        longestStreak: streakOutcome.state.longestDays,
        totalRounds: Object.values(categoryRounds).reduce((total, count) => total + count, 0),
        testsFinished,
        categoryRounds,
        brainMap,
        neuropeak: neuropeakScore(brainMap),
        bestLeagueTier: league.bestTier,
        bestWeeklyXp: league.bestWeeklyXp,
        bestIq,
      };

      const earned = newlyEarnedBadges(BADGES, badgeContext, current.badges) as ContentBadge[];
      const badgeStars = starsForBadges(earned);

      const stars =
        current.stars +
        options.starGain +
        taskStars +
        badgeStars +
        (leveledUp ? STAR_REWARDS.levelUp : 0);

      // Kutlama önceliği: rozet > seviye atlama > seri eşiği > görev.
      const firstBadge = earned[0];
      if (firstBadge !== undefined) {
        setCelebration({
          type: 'badge',
          title: firstBadge.title.tr,
          count: earned.length,
          stars: badgeStars,
        });
      } else if (leveledUp) {
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
        brainMap,
        categoryRounds,
        league,
        testsFinished,
        bestIq,
        badges: [...current.badges, ...earned.map((badge) => badge.id)],
        history: recordDayActivity(current.history, today, {
          xp: options.xpGain,
          rounds: options.round === undefined ? 0 : 1,
        }),
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
        round: {
          category: options.category,
          performance: roundPerformance({
            mode: options.mode,
            level: options.level,
            completed: options.completed,
            difficulty: options.difficulty,
          }),
        },
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
        testIq: iq,
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

  const grantRewardedAdStars = useCallback<
    ProgressContextValue['grantRewardedAdStars']
  >(async () => {
    const current = stateRef.current;

    // Günlük sınır çekirdekte kontrol ediliyor; burada yalnızca
    // sayaç ve yıldız işleniyor.
    await commit({
      ...current,
      stars: current.stars + STAR_REWARDS.rewardedAd,
      rewardedAdsToday: current.rewardedAdsToday + 1,
    });
  }, [commit]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      level: levelProgress(state.xp),
      neuropeak: neuropeakScore(state.brainMap),
      userId,
      badges: BADGES,
      ready,
      celebration,
      clearCelebration: () => setCelebration(null),
      recordGameRound,
      recordTestFinished,
      spendStars,
      grantRewardedAdStars,
    }),
    [
      celebration,
      grantRewardedAdStars,
      ready,
      recordGameRound,
      recordTestFinished,
      spendStars,
      state,
      userId,
    ],
  );

  return <ProgressContext value={value}>{children}</ProgressContext>;
}

export function useProgress(): ProgressContextValue {
  return use(ProgressContext);
}
