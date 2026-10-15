export {
  AXIS_SCORE_MAX,
  AXIS_SCORE_MIN,
  AXIS_WEIGHTS,
  BRAIN_AXES,
  type BrainAxis,
  type BrainMap,
} from './domain/brain-axes';

export {
  DIFFICULTY_MULTIPLIERS,
  GAME_CATEGORIES,
  GAME_CATEGORY_META,
  type Difficulty,
  type GameCategory,
  type GameCategoryMeta,
  type GameMode,
} from './domain/categories';

export { clamp, lerp, standardNormalCdf } from './utils/math';

export {
  MAX_ATTEMPTS,
  MAX_QUEUE_SIZE,
  backoffMs,
  dueItems,
  enqueue,
  markFailed,
  markSucceeded,
  pendingCount,
  type NewOutboxItem,
  type OutboxItem,
} from './sync/outbox';

export { createRng, sample, seedFromString, shuffle, type Rng } from './random';

export {
  DEFAULT_NORM,
  DEFAULT_SCORING_CONFIG,
  IQ_MAX,
  IQ_MIN,
  REPORT_DIMENSIONS,
  bandForIq,
  dimensionOf,
  scoreTest,
  type AnsweredQuestion,
  type QuestionKind,
  type ReportDimension,
  type ScoreBand,
  type ScoreResult,
  type ScoringConfig,
  type ScoringNorm,
} from './scoring/score';

export {
  MAX_LEVEL,
  levelForXp,
  levelProgress,
  totalXpForLevel,
  type LevelProgress,
} from './gamification/levels';

export {
  EMPTY_STREAK,
  STREAK_MILESTONES,
  isStreakAlive,
  recordActivity,
  toDateKey,
  type StreakOutcome,
  type StreakState,
} from './gamification/streak';

export {
  BASE_GAME_XP,
  DAILY_REWARDED_AD_LIMIT,
  STAR_COSTS,
  STAR_REWARDS,
  TEST_COMPLETION_XP,
  xpForGameRound,
  xpForTestCompletion,
} from './gamification/rewards';

export {
  DAILY_TASK_COUNT,
  applyTaskEvent,
  completedTaskCount,
  pickDailyTasks,
  type DailyTask,
  type DailyTaskTemplate,
  type TaskEvent,
  type TaskMetric,
} from './gamification/daily-tasks';
