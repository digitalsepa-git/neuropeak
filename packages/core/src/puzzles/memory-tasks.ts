import { createRng, shuffle, type Rng } from '../random';

/**
 * İki hafıza görevi: N-Geri ve ızgara hatırlama.
 *
 * İkisinin de zorluğu "kaç şey akılda tutulacak" üzerinden ayarlanıyor,
 * ama üretimde dikkat edilen şey başka: dizinin ne kadarının eşleşme
 * olacağı. Eşleşme çok seyrekse oyuncu her seferinde "hayır" diyerek
 * yüksek puan alır; çok sıksa görev kolaylaşır. Üreteç bu oranı hedefe
 * yakın tutuyor.
 */

export type NBackSequence = {
  readonly symbols: readonly number[];
  /** `symbols[i] === symbols[i - n]` olan indeksler. */
  readonly matches: readonly number[];
  readonly n: number;
};

/** Oyuncu ilerledikçe kaç adım geriye bakılacağı. */
export function nBackLevel(correctStreak: number): number {
  return Math.min(4, 1 + Math.floor(correctStreak / 8));
}

/**
 * @param alphabet Kaç farklı simge kullanılacağı.
 * @param matchRate Eşleşme olması hedeflenen oran (0–1).
 */
export function generateNBack(
  length: number,
  n: number,
  seed: number,
  alphabet = 6,
  matchRate = 0.3,
): NBackSequence {
  const rng = createRng(seed);
  const symbols: number[] = [];
  const matches: number[] = [];

  for (let index = 0; index < length; index += 1) {
    const previous = symbols[index - n];

    if (previous !== undefined && rng() < matchRate) {
      symbols.push(previous);
      matches.push(index);
      continue;
    }

    // Eşleşme istenmiyorsa n adım geriki simge bilerek eleniyor;
    // yoksa rastgelelik "kazara" eşleşme üretip oranı bozar.
    const options: number[] = [];
    for (let symbol = 0; symbol < alphabet; symbol += 1) {
      if (symbol !== previous) options.push(symbol);
    }

    symbols.push(options[Math.floor(rng() * options.length)] as number);
  }

  return { symbols, matches, n };
}

export type GridRecallPuzzle = {
  readonly size: number;
  /** Yanıp sönecek hücreler; `row * size + column`. */
  readonly cells: readonly number[];
};

export function gridRecallSizeForLevel(level: number): number {
  return Math.min(6, 3 + Math.floor((level - 1) / 4));
}

export function gridRecallCountForLevel(level: number): number {
  const size = gridRecallSizeForLevel(level);
  // Hücre sayısı ızgaranın üçte birini geçmesin; geçerse görev
  // hatırlamaktan çok "neredeyse hepsi" tahminine dönüşüyor.
  return Math.min(Math.floor((size * size) / 3), 3 + Math.floor((level - 1) / 2));
}

export function generateGridRecall(level: number, seed: number): GridRecallPuzzle {
  const size = gridRecallSizeForLevel(level);
  const count = gridRecallCountForLevel(level);
  const rng: Rng = createRng(seed);

  const cells = shuffle(
    Array.from({ length: size * size }, (_, index) => index),
    rng,
  ).slice(0, count);

  return { size, cells: [...cells].sort((a, b) => a - b) };
}
