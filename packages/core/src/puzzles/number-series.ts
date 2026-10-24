import { createRng, shuffle, type Rng } from '../random';

/**
 * Sayı Dizisi bulmacası.
 *
 * Diziler kurallardan üretilir, dolayısıyla devamı tektir. Çeldiriciler
 * doğru cevabın yakınından seçilir: hepsi makul görünür ama yalnızca
 * biri kuralı sürdürür.
 */

export type NumberSeriesPuzzle = {
  readonly sequence: readonly number[];
  readonly answer: number;
  readonly options: readonly number[];
  readonly correctIndex: number;
  /**
   * Kuralın kimliği; doğru cevaptan sonra açıklama olarak gösteriliyor.
   * Adı değil kimliği döndürüyoruz — cümleyi arayüz kuruyor, böylece
   * açıklama iki dilde de doğru çıkıyor.
   */
  readonly rule: NumberSeriesRule;
};

/** Dizinin kurulduğu kural. Arayüz bunları kendi kataloğunda adlandırıyor. */
export const NUMBER_SERIES_RULES = [
  'constant-step',
  'constant-factor',
  'squares',
  'growing-gap',
  'sum-of-previous',
  'multiply-and-add',
] as const;

export type NumberSeriesRule = (typeof NUMBER_SERIES_RULES)[number];

type SeriesRule = {
  readonly id: NumberSeriesRule;
  /** Diziyi üretir; son eleman cevaptır. */
  readonly build: (rng: Rng) => number[];
  /** Kuralın hangi seviyeden sonra devreye gireceği. */
  readonly minLevel: number;
};

function randomInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

const RULES: SeriesRule[] = [
  {
    id: 'constant-step',
    minLevel: 1,
    build: (rng) => {
      const start = randomInt(rng, 1, 12);
      const step = randomInt(rng, 2, 9);
      return Array.from({ length: 6 }, (_, index) => start + step * index);
    },
  },
  {
    id: 'constant-factor',
    minLevel: 1,
    build: (rng) => {
      const start = randomInt(rng, 1, 5);
      const factor = randomInt(rng, 2, 3);
      return Array.from({ length: 5 }, (_, index) => start * factor ** index);
    },
  },
  {
    id: 'squares',
    minLevel: 3,
    build: (rng) => {
      const start = randomInt(rng, 1, 5);
      return Array.from({ length: 5 }, (_, index) => (start + index) ** 2);
    },
  },
  {
    id: 'growing-gap',
    minLevel: 4,
    build: (rng) => {
      const start = randomInt(rng, 1, 8);
      const firstStep = randomInt(rng, 1, 4);
      const values = [start];
      for (let index = 1; index < 6; index += 1) {
        values.push((values[index - 1] as number) + firstStep + index - 1);
      }
      return values;
    },
  },
  {
    id: 'sum-of-previous',
    minLevel: 6,
    build: (rng) => {
      const first = randomInt(rng, 1, 5);
      const second = first + randomInt(rng, 1, 4);
      const values = [first, second];
      for (let index = 2; index < 7; index += 1) {
        values.push((values[index - 1] as number) + (values[index - 2] as number));
      }
      return values;
    },
  },
  {
    id: 'multiply-and-add',
    minLevel: 8,
    build: (rng) => {
      const start = randomInt(rng, 1, 4);
      const factor = 2;
      const add = randomInt(rng, 1, 3);
      const values = [start];
      for (let index = 1; index < 5; index += 1) {
        values.push((values[index - 1] as number) * factor + add);
      }
      return values;
    },
  },
];

/** Doğru cevabın yakınından, birbirinden farklı çeldiriciler üretir. */
function distractorsFor(answer: number, sequence: readonly number[], rng: Rng): number[] {
  const previous = sequence[sequence.length - 2] ?? answer;
  const lastStep = answer - previous;

  const candidates = [
    answer + Math.max(1, Math.round(lastStep / 2)),
    answer - Math.max(1, Math.round(lastStep / 2)),
    answer + lastStep,
    previous + Math.max(1, lastStep - 1),
    answer + randomInt(rng, 1, 5),
    answer - randomInt(rng, 1, 5),
  ];

  const unique: number[] = [];
  for (const candidate of shuffle(candidates, rng)) {
    if (candidate === answer || candidate < 0) continue;
    if (unique.includes(candidate)) continue;
    unique.push(candidate);
    if (unique.length === 3) break;
  }

  let filler = 1;
  while (unique.length < 3) {
    const candidate = answer + filler * 7;
    if (candidate !== answer && !unique.includes(candidate)) unique.push(candidate);
    filler += 1;
  }

  return unique;
}

export function generateNumberSeries(level: number, seed: number): NumberSeriesPuzzle {
  const rng = createRng(seed);
  const available = RULES.filter((rule) => rule.minLevel <= level);
  const rule = available[Math.floor(rng() * available.length)] as SeriesRule;

  const values = rule.build(rng);
  const answer = values[values.length - 1] as number;
  const sequence = values.slice(0, -1);
  const options = shuffle([answer, ...distractorsFor(answer, values, rng)], rng);

  return {
    sequence,
    answer,
    options,
    correctIndex: options.indexOf(answer),
    rule: rule.id,
  };
}
