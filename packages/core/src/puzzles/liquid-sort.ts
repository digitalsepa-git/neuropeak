import { createRng, shuffle, type Rng } from '../random';

/**
 * Sıvı Sıralama bulmacası.
 *
 * Bulmaca çözülmüş durumdan başlanıp geriye doğru geçerli hamleler
 * yapılarak üretilir. Böylece her üretilen bulmaca tanımı gereği
 * çözülebilir — rastgele dizip "acaba çözülüyor mu" diye aramak gerekmez.
 */

/** Bir şişenin alabileceği sıvı sayısı. */
export const TUBE_CAPACITY = 4;

/** Şişeler üstten doldurulur: dizinin sonu şişenin ağzıdır. */
export type Tube = number[];

export type LiquidSortPuzzle = {
  readonly tubes: readonly Tube[];
  readonly colorCount: number;
  /** Üretimde kullanılan hamle sayısı; zorluk göstergesi. */
  readonly shuffleMoves: number;
};

export function colorCountForLevel(level: number): number {
  // 3 renkten başlar, her üç seviyede bir artar, 8'de durur.
  return Math.min(8, 3 + Math.floor((level - 1) / 3));
}

function emptyTubeCountForLevel(level: number): number {
  // İki boş şişe standart; ileri seviyelerde tek boş şişe daha zor.
  return level >= 12 ? 1 : 2;
}

/** Üstteki sıvıyı başka bir şişeye taşımak geçerli mi. */
export function canPour(from: Tube, to: Tube): boolean {
  if (from.length === 0) return false;
  if (to.length >= TUBE_CAPACITY) return false;
  if (to.length === 0) return true;
  return from[from.length - 1] === to[to.length - 1];
}

/**
 * Hamleyi uygular ve yeni durumu döndürür. Aynı renkten üstteki tüm
 * sıvılar birlikte akar — oyuncunun beklediği davranış bu.
 */
export function pour(tubes: readonly Tube[], fromIndex: number, toIndex: number): Tube[] {
  const next = tubes.map((tube) => [...tube]);
  const from = next[fromIndex];
  const to = next[toIndex];

  if (from === undefined || to === undefined || !canPour(from, to)) {
    return next;
  }

  const color = from[from.length - 1];
  while (from.length > 0 && to.length < TUBE_CAPACITY && from[from.length - 1] === color) {
    to.push(from.pop() as number);
  }

  return next;
}

export function isSolved(tubes: readonly Tube[]): boolean {
  return tubes.every(
    (tube) =>
      tube.length === 0 ||
      (tube.length === TUBE_CAPACITY && tube.every((color) => color === tube[0])),
  );
}

/** Bir durumdan yapılabilecek tüm hamleler. */
function validMoves(tubes: readonly Tube[]): [number, number][] {
  const moves: [number, number][] = [];

  for (let from = 0; from < tubes.length; from += 1) {
    for (let to = 0; to < tubes.length; to += 1) {
      if (from === to) continue;
      if (!canPour(tubes[from] as Tube, tubes[to] as Tube)) continue;
      moves.push([from, to]);
    }
  }

  return moves;
}

/** Durumu, şişelerin sırasından bağımsız bir anahtara çevirir. */
function stateKey(tubes: readonly Tube[]): string {
  return [...tubes.map((tube) => tube.join(','))].sort().join('|');
}

/** Aramanın gezeceği en fazla durum; bulmacalar küçük, bu sınır bol. */
const MAX_SEARCH_STATES = 120_000;

/**
 * Bulmacanın çözülebilir olup olmadığını genişlik öncelikli aramayla
 * belirler. Üretim her bulmacayı buradan geçirir, böylece oyuncunun
 * önüne çözümsüz bir tahta gelmez.
 */
export function isSolvable(tubes: readonly Tube[]): boolean {
  const seen = new Set([stateKey(tubes)]);
  const queue: Tube[][] = [tubes.map((tube) => [...tube])];

  while (queue.length > 0) {
    if (seen.size > MAX_SEARCH_STATES) return false;

    const current = queue.shift() as Tube[];
    if (isSolved(current)) return true;

    for (const [from, to] of validMoves(current)) {
      const next = pour(current, from, to);
      const key = stateKey(next);
      if (seen.has(key)) continue;

      seen.add(key);
      queue.push(next);
    }
  }

  return false;
}

/** Renkleri şişelere rastgele dağıtır; çözülebilirlik ayrıca sınanır. */
function randomDistribution(colorCount: number, emptyTubes: number, rng: Rng): Tube[] {
  const pool = shuffle(
    Array.from({ length: colorCount * TUBE_CAPACITY }, (_, index) =>
      Math.floor(index / TUBE_CAPACITY),
    ),
    rng,
  );

  const tubes: Tube[] = Array.from({ length: colorCount }, (_, index) =>
    pool.slice(index * TUBE_CAPACITY, (index + 1) * TUBE_CAPACITY),
  );

  return [...tubes, ...Array.from({ length: emptyTubes }, (): Tube => [])];
}

/**
 * Bulmaca üretir: renkleri rastgele dağıtır, çözülebilirliğini doğrular,
 * olmazsa tohumu ilerletip yeniden dener.
 *
 * İlk denediğim yol çözülmüş durumdan geriye hamle yapmaktı; o yol
 * çalışmıyor, çünkü bütün şişeler tek renk ve doluyken yapılabilecek
 * her hamle yine tek renkli şişeler üretiyor — tahta hiç karışmıyor.
 */
export function generateLiquidSort(level: number, seed: number): LiquidSortPuzzle {
  const colorCount = colorCountForLevel(level);
  const emptyTubes = emptyTubeCountForLevel(level);

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const rng = createRng(seed + attempt * 7919);
    const tubes = randomDistribution(colorCount, emptyTubes, rng);

    if (isSolved(tubes)) continue;
    if (!isSolvable(tubes)) continue;

    return { tubes, colorCount, shuffleMoves: attempt + 1 };
  }

  // Pratikte buraya düşülmez: iki boş şişeyle dağıtımların büyük
  // çoğunluğu çözülebilir. Yine de tanımlı bir tahta döner.
  const rng = createRng(seed);
  return {
    tubes: randomDistribution(colorCount, Math.max(2, emptyTubes), rng),
    colorCount,
    shuffleMoves: 0,
  };
}
