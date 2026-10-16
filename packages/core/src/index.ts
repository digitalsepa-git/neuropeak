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

export {
  TUBE_CAPACITY,
  canPour,
  colorCountForLevel,
  generateLiquidSort,
  isSolvable,
  isSolved,
  pour,
  type LiquidSortPuzzle,
  type Tube,
} from './puzzles/liquid-sort';

export {
  MATRIX_SHAPES,
  generateMatrixPuzzle,
  visualKey,
  visuallyEqual,
  type MatrixCell,
  type MatrixPuzzle,
  type MatrixShape,
} from './puzzles/matrix';

export {
  chainLengthForLevel,
  generateLogicChain,
  type LogicChainPuzzle,
} from './puzzles/logic-chain';

export { generateNumberSeries, type NumberSeriesPuzzle } from './puzzles/number-series';

export {
  generateTargetNumber,
  solveTargetNumber,
  type TargetNumberPuzzle,
} from './puzzles/target-number';

export {
  generateQuickMath,
  type QuickMathDifficulty,
  type QuickMathProblem,
} from './puzzles/quick-math';

export {
  boundsOf,
  generateChiralShape,
  growShape,
  isChiral,
  mirror,
  normalize,
  rotate,
  rotateTimes,
  rotations,
  sameUpToRotation,
  shapeKey,
  type Cell,
  type Shape,
} from './puzzles/shapes';

export {
  PAPER_SIZE,
  generatePaperFold,
  patternKey,
  unfold,
  type FoldAxis,
  type HolePattern,
  type PaperFoldPuzzle,
} from './puzzles/paper-fold';

export {
  anagramLengthForLevel,
  generateAnagram,
  generateWordAnalogy,
  generateWordPair,
  type AnagramEntry,
  type AnagramPuzzle,
  type AnalogyEntry,
  type AnalogyPuzzle,
  type WordPairEntry,
  type WordPairMode,
  type WordPairPuzzle,
} from './puzzles/words';

export {
  edgeKey,
  generateOneLine,
  hasEulerPath,
  type Edge,
  type OneLinePuzzle,
} from './puzzles/one-line';

export {
  WALL_EAST,
  WALL_NORTH,
  WALL_SOUTH,
  WALL_WEST,
  generateMaze,
  isBlocked,
  mazeSizeForLevel,
  solveMaze,
  type MazePuzzle,
} from './puzzles/maze';

export {
  connectPairsForLevel,
  connectSizeForLevel,
  generateConnect,
  isConnectSolved,
  neighbourCells,
  type ConnectPair,
  type ConnectPuzzle,
} from './puzzles/connect';

export {
  generateQuickDecision,
  type QuickDecisionDifficulty,
  type QuickDecisionTrial,
} from './puzzles/quick-decision';

export { toTurkishUpper, turkishDativeSuffix } from './utils/turkish';

export {
  generateGridRecall,
  generateNBack,
  gridRecallCountForLevel,
  gridRecallSizeForLevel,
  nBackLevel,
  type GridRecallPuzzle,
  type NBackSequence,
} from './puzzles/memory-tasks';

export {
  BALL_RADIUS,
  FIELD,
  generateTracking,
  stepTracking,
  trackingBallsForLevel,
  trackingTargetsForLevel,
  type Ball,
  type TrackingRound,
} from './puzzles/tracking';

export {
  generateBalance,
  type BalanceHint,
  type BalancePuzzle,
  type BalanceShape,
} from './puzzles/balance';

export {
  canPlaceTile,
  generateTiling,
  tileCells,
  tilingShapeForLevel,
  type TilingPiece,
  type TilingPlacement,
  type TilingPuzzle,
} from './puzzles/tiling';

export {
  EMPTY_BRAIN_MAP,
  FALL_RATE,
  INITIAL_AXIS_SCORE,
  RISE_RATE,
  applyRoundToBrainMap,
  axisForCategory,
  categoriesForAxis,
  neuropeakScore,
  roundPerformance,
  strongestAxis,
  weakestAxis,
  type RoundPerformanceInput,
} from './gamification/brain-map';

export {
  HISTORY_DAYS,
  lastDays,
  rankCategories,
  recordCategoryRound,
  recordDayActivity,
  type CategoryCounts,
  type DayActivity,
} from './gamification/activity';

export {
  GROUP_SIZE,
  LEAGUE_TIERS,
  PROMOTION_COUNT,
  RELEGATION_COUNT,
  formatRemaining,
  generatePracticeCohort,
  msUntilWeekEnd,
  outcomeForRank,
  standings,
  tierAfter,
  weekProgress,
  weekStartKey,
  xpToPromotion,
  type LeagueMember,
  type LeagueOutcome,
  type LeagueStanding,
  type LeagueTier,
} from './gamification/league';
