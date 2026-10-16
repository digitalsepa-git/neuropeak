import { createRng, shuffle, type Rng } from '../random';

/**
 * Hızlı İşlem sorusu. Süreli oyunda saniyede bir soru üretilebilmesi
 * gerektiği için üretim ucuz: sonuç baştan hesaplanır, çeldiriciler
 * yakın değerlerden seçilir.
 */

export type QuickMathProblem = {
  readonly text: string;
  readonly answer: number;
  readonly options: readonly number[];
  readonly correctIndex: number;
};

export type QuickMathDifficulty = 'easy' | 'medium' | 'hard';

function randomInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/**
 * Zorluğa göre terim aralığı. Alt sınır da yükselir: "2 − 2" gibi
 * anlamsız kolay sorular orta ve zor seviyede çıkmamalı.
 */
const TERM_RANGE: Record<QuickMathDifficulty, [number, number]> = {
  easy: [2, 20],
  medium: [11, 60],
  hard: [21, 99],
};

function buildProblem(difficulty: QuickMathDifficulty, rng: Rng): { text: string; answer: number } {
  const operations = difficulty === 'easy' ? ['+', '−'] : ['+', '−', '×'];
  const operation = operations[Math.floor(rng() * operations.length)] as string;
  const [min, max] = TERM_RANGE[difficulty];

  if (operation === '×') {
    // Çarpmada terimler küçük ama sonuç anlamlı; zor seviyede taban yükselir.
    const factorMin = difficulty === 'hard' ? 3 : 2;
    const factorMax = difficulty === 'hard' ? 12 : 9;
    const a = randomInt(rng, factorMin, factorMax);
    const b = randomInt(rng, factorMin, factorMax);
    return { text: `${a} × ${b}`, answer: a * b };
  }

  if (operation === '−') {
    // Sonuç her zaman pozitif ve sıfırdan farklı: büyük olan baştadır.
    const a = randomInt(rng, min + 1, max);
    const b = randomInt(rng, 1, a - 1);
    return { text: `${a} − ${b}`, answer: a - b };
  }

  const a = randomInt(rng, min, max);
  const b = randomInt(rng, min, max);
  return { text: `${a} + ${b}`, answer: a + b };
}

export function generateQuickMath(difficulty: QuickMathDifficulty, seed: number): QuickMathProblem {
  const rng = createRng(seed);
  const { text, answer } = buildProblem(difficulty, rng);

  const candidates = [
    answer + 1,
    answer - 1,
    answer + 10,
    answer - 10,
    answer + randomInt(rng, 2, 9),
    Math.max(0, answer - randomInt(rng, 2, 9)),
  ];

  const distractors: number[] = [];
  for (const candidate of shuffle(candidates, rng)) {
    if (candidate === answer || candidate < 0) continue;
    if (distractors.includes(candidate)) continue;
    distractors.push(candidate);
    if (distractors.length === 3) break;
  }

  let filler = 1;
  while (distractors.length < 3) {
    const candidate = answer + filler * 13;
    if (!distractors.includes(candidate)) distractors.push(candidate);
    filler += 1;
  }

  const options = shuffle([answer, ...distractors], rng);

  return { text, answer, options, correctIndex: options.indexOf(answer) };
}
