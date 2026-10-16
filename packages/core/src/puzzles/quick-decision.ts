import { createRng, type Rng } from '../random';

/**
 * Hızlı Karar — iki kümeyi karşılaştırma.
 *
 * Soru iki türden biri: "hangi tarafta daha çok nokta var" ya da
 * "sayılar aynı mı". İki tür dönüşümlü sorulduğu için oyuncu kalıba
 * bağlanamıyor, her turda soruyu okumak zorunda kalıyor. Zorluk iki
 * küme arasındaki farkı daraltıyor: fark küçüldükçe göz saymak yerine
 * tahmin etmeye başlıyor.
 */

export type QuickDecisionDifficulty = 'easy' | 'medium' | 'hard';

export type QuickDecisionTrial = {
  readonly left: number;
  readonly right: number;
  readonly prompt: string;
  readonly options: readonly [string, string];
  readonly correctIndex: number;
};

/** Zorluğa göre küme büyüklüğü ve iki küme arasındaki en büyük fark. */
const RANGE: Record<QuickDecisionDifficulty, { count: [number, number]; gap: [number, number] }> = {
  easy: { count: [3, 9], gap: [3, 5] },
  medium: { count: [5, 14], gap: [2, 3] },
  hard: { count: [8, 20], gap: [1, 2] },
};

function randomInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function generateQuickDecision(
  difficulty: QuickDecisionDifficulty,
  seed: number,
): QuickDecisionTrial {
  const rng = createRng(seed);
  const { count, gap } = RANGE[difficulty];

  const asksEqual = rng() < 0.4;
  const base = randomInt(rng, count[0], count[1]);

  if (asksEqual) {
    const equal = rng() < 0.5;
    const difference = equal ? 0 : randomInt(rng, gap[0], gap[1]);
    const onLeft = rng() < 0.5;

    return {
      left: onLeft ? base + difference : base,
      right: onLeft ? base : base + difference,
      prompt: 'Nokta sayıları aynı mı?',
      options: ['Aynı', 'Farklı'],
      correctIndex: equal ? 0 : 1,
    };
  }

  const difference = randomInt(rng, gap[0], gap[1]);
  const leftWins = rng() < 0.5;

  return {
    left: leftWins ? base + difference : base,
    right: leftWins ? base : base + difference,
    prompt: 'Hangi tarafta daha çok nokta var?',
    options: ['Sol', 'Sağ'],
    correctIndex: leftWins ? 0 : 1,
  };
}
