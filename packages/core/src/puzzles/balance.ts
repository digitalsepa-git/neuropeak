import { createRng, shuffle, type Rng } from '../random';

/**
 * Terazi — şekillerin gizli ağırlıklarını denge eşitliklerinden çıkarma.
 *
 * Oyuncuya iki ipucu terazisi gösteriliyor ("bir üçgen iki daire eder"
 * gibi), sonra üçüncü bir terazinin eksik tarafı soruluyor. Ağırlıklar
 * önce seçilip eşitlikler onlardan türetildiği için her sorunun tek ve
 * tam sayı bir cevabı var — üreteç kesirli ya da çelişkili bir ipucu
 * takımı üretemiyor.
 */

/** Daire birim ağırlık; diğer şekiller onun katı. */
export type BalanceShape = 'circle' | 'triangle' | 'square' | 'diamond';

export type BalanceHint = {
  /** Sol kefedeki tek şekil. */
  readonly shape: BalanceShape;
  /** Sağ kefeyi dengeleyen daire sayısı. */
  readonly circles: number;
};

export type BalancePuzzle = {
  readonly hints: readonly BalanceHint[];
  /** Sorulan terazinin sol kefesi. */
  readonly question: readonly BalanceShape[];
  /** Doğru cevap: kaç daire gerekir. */
  readonly answer: number;
  readonly options: readonly number[];
  readonly correctIndex: number;
};

const SHAPES: readonly BalanceShape[] = ['triangle', 'square', 'diamond'];

function randomInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Seviyeye göre kaç şeklin ağırlığı verilecek ve soru kaç parçalı olacak. */
function shapeForLevel(level: number): { hintCount: number; termCount: number; maxWeight: number } {
  return {
    hintCount: Math.min(3, 1 + Math.floor((level - 1) / 4)),
    termCount: Math.min(4, 2 + Math.floor((level - 1) / 5)),
    maxWeight: Math.min(9, 3 + Math.floor((level - 1) / 3)),
  };
}

function distractorsFor(answer: number, rng: Rng): number[] {
  const candidates = [
    answer + 1,
    answer - 1,
    answer + 2,
    answer - 2,
    answer + randomInt(rng, 3, 5),
    Math.max(1, answer - randomInt(rng, 3, 5)),
  ];

  const unique: number[] = [];
  for (const candidate of shuffle(candidates, rng)) {
    if (candidate <= 0 || candidate === answer || unique.includes(candidate)) continue;
    unique.push(candidate);
    if (unique.length === 3) break;
  }

  let filler = 1;
  while (unique.length < 3) {
    const candidate = answer + filler * 7;
    if (!unique.includes(candidate)) unique.push(candidate);
    filler += 1;
  }

  return unique;
}

export function generateBalance(level: number, seed: number): BalancePuzzle {
  const rng = createRng(seed);
  const { hintCount, termCount, maxWeight } = shapeForLevel(level);

  const used = shuffle([...SHAPES], rng).slice(0, hintCount);
  const weights = new Map<BalanceShape, number>([['circle', 1]]);

  for (const shape of used) {
    weights.set(shape, randomInt(rng, 2, maxWeight));
  }

  const hints = used.map((shape) => ({
    shape,
    circles: weights.get(shape) as number,
  }));

  // Soru yalnızca ağırlığı verilmiş şekillerden kurulur; yoksa cevap
  // bilinemez olurdu.
  const question: BalanceShape[] = [];
  for (let index = 0; index < termCount; index += 1) {
    question.push(used[Math.floor(rng() * used.length)] as BalanceShape);
  }

  const answer = question.reduce((total, shape) => total + (weights.get(shape) as number), 0);
  const options = shuffle([answer, ...distractorsFor(answer, rng)], rng);

  return {
    hints,
    question,
    answer,
    options,
    correctIndex: options.indexOf(answer),
  };
}
