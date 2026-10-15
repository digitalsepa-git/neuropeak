import { DIFFICULTY_MULTIPLIERS, type Difficulty } from '../domain/categories';

/** Bir oyun turunun temel XP'si; oyun tanımında üzerine yazılabilir. */
export const BASE_GAME_XP = 10;

/** Test tamamlamanın XP'si — bir oyun turundan belirgin şekilde fazla. */
export const TEST_COMPLETION_XP = 120;

/** Yıldız ödülleri. */
export const STAR_REWARDS = {
  gameComplete: 1,
  testComplete: 10,
  dailyTask: 15,
  dailyLogin: 5,
  rewardedAd: 20,
  levelUp: 25,
} as const;

/** Yıldız harcamaları. */
export const STAR_COSTS = {
  hint: 20,
  undo: 10,
  skipLevel: 40,
  streakFreeze: 60,
} as const;

/** Günde reklam izleyerek en fazla bu kadar yıldız kazanılabilir. */
export const DAILY_REWARDED_AD_LIMIT = 3;

/**
 * Bir oyun turunun XP'si: oyunun temel değeri, zorluk çarpanı ve
 * tamamlanma durumuna göre. Yarıda bırakılan tur yarım XP verir —
 * hiç vermemek denemeyi cezalandırırdı.
 */
export function xpForGameRound(options: {
  baseXp?: number;
  difficulty: Difficulty;
  completed: boolean;
}): number {
  const base = options.baseXp ?? BASE_GAME_XP;
  const multiplier = DIFFICULTY_MULTIPLIERS[options.difficulty];
  const completionFactor = options.completed ? 1 : 0.5;

  return Math.max(1, Math.round(base * multiplier * completionFactor));
}

/**
 * Test tamamlamanın XP'si. Skor yükseldikçe bir miktar artar ama taban
 * ödül korunur: düşük skor alan da emeğinin karşılığını görür.
 */
export function xpForTestCompletion(iq: number): number {
  const bonusRatio = Math.max(0, Math.min(1, (iq - 70) / 70));
  return Math.round(TEST_COMPLETION_XP * (1 + bonusRatio * 0.5));
}
