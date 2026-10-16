import { createRng, shuffle } from '../random';

/**
 * Hedef Sayı bulmacası (24 oyununun genellemesi).
 *
 * Dört sayı ve dört işlemle bir hedefe ulaşılır. Üretilen her bulmaca
 * çözücüden geçirilir: çözümü olmayan bir tahta oyuncuya gösterilmez.
 */

export type TargetNumberPuzzle = {
  readonly numbers: readonly number[];
  readonly target: number;
  /** Bulunan örnek çözüm; ipucu ve açıklama için. */
  readonly solution: string;
};

/** Kayan nokta karşılaştırmasında kabul edilen sapma. */
const EPSILON = 1e-6;

type Expression = { value: number; text: string };

/**
 * Verilen sayılarla ulaşılabilen bir ifadeyi arar. Dört sayı için arama
 * uzayı küçük; tüm ikili birleşimler özyinelemeli olarak denenir.
 */
function search(items: readonly Expression[], target: number): string | null {
  if (items.length === 1) {
    const only = items[0] as Expression;
    return Math.abs(only.value - target) < EPSILON ? only.text : null;
  }

  for (let i = 0; i < items.length; i += 1) {
    for (let j = 0; j < items.length; j += 1) {
      if (i === j) continue;

      const a = items[i] as Expression;
      const b = items[j] as Expression;
      const rest = items.filter((_, index) => index !== i && index !== j);

      const combinations: Expression[] = [
        { value: a.value + b.value, text: `(${a.text} + ${b.text})` },
        { value: a.value - b.value, text: `(${a.text} − ${b.text})` },
        { value: a.value * b.value, text: `(${a.text} × ${b.text})` },
      ];

      // Oyun yalnızca tam bölünmeyi kabul ediyor; çözücü de aynı kurala
      // uymalı, yoksa ekranda çözülemeyen bulmacalar çıkar.
      if (b.value !== 0 && Number.isInteger(a.value / b.value)) {
        combinations.push({ value: a.value / b.value, text: `(${a.text} ÷ ${b.text})` });
      }

      for (const combination of combinations) {
        const found = search([...rest, combination], target);
        if (found !== null) return found;
      }
    }
  }

  return null;
}

/** Sayılarla hedefe ulaşan bir çözüm varsa döndürür. */
export function solveTargetNumber(numbers: readonly number[], target: number): string | null {
  return search(
    numbers.map((value) => ({ value, text: `${value}` })),
    target,
  );
}

function targetRangeForLevel(level: number): [number, number] {
  // Düşük seviyelerde küçük hedefler; ilerledikçe aralık genişler.
  const max = Math.min(100, 20 + level * 6);
  return [10, max];
}

function maxNumberForLevel(level: number): number {
  return Math.min(12, 6 + Math.floor(level / 3));
}

export function generateTargetNumber(level: number, seed: number): TargetNumberPuzzle {
  const maxNumber = maxNumberForLevel(level);
  const [minTarget, maxTarget] = targetRangeForLevel(level);

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const rng = createRng(seed + attempt * 7919);

    const numbers = shuffle(
      Array.from({ length: 4 }, () => 1 + Math.floor(rng() * maxNumber)),
      rng,
    );
    const target = minTarget + Math.floor(rng() * (maxTarget - minTarget + 1));

    const solution = solveTargetNumber(numbers, target);
    if (solution !== null) {
      return { numbers, target, solution };
    }
  }

  // Dört sayı ve dört işlemle 10–30 arası bir hedefe ulaşmak neredeyse
  // her zaman mümkün; yine de tanımlı bir bulmaca döner.
  return { numbers: [2, 3, 4, 5], target: 24, solution: '((2 × 3) × 4)' };
}
