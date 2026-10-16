import { createRng, shuffle, type Rng } from '../random';

/**
 * Bağlantı — aynı renk iki noktayı, yollar birbirini kesmeden bağlama.
 *
 * Bulmaca yine çözümünden üretiliyor: ızgarada birbirine değmeyen
 * yollar oyuluyor, sonra yalnızca uçları bırakılıyor. Oyuncuya
 * gösterilen tahta için en az bir çözüm olduğu kesin — oyulan yolların
 * kendisi. Oyuncunun başka bir çözüm bulması da serbest; kural tek:
 * hiçbir hücre iki yolda birden olmayacak.
 */

export type ConnectPair = {
  readonly color: number;
  readonly a: number;
  readonly b: number;
};

export type ConnectPuzzle = {
  readonly size: number;
  readonly pairs: readonly ConnectPair[];
  /** Üretimde oyulan yollar; ipucu ve testler için. */
  readonly solution: readonly (readonly number[])[];
};

export function connectSizeForLevel(level: number): number {
  return Math.min(7, 4 + Math.floor((level - 1) / 4));
}

export function connectPairsForLevel(level: number): number {
  return Math.min(5, 2 + Math.floor((level - 1) / 3));
}

export function neighbourCells(index: number, size: number): number[] {
  const row = Math.floor(index / size);
  const column = index % size;
  const result: number[] = [];

  if (row > 0) result.push(index - size);
  if (row < size - 1) result.push(index + size);
  if (column > 0) result.push(index - 1);
  if (column < size - 1) result.push(index + 1);

  return result;
}

/** Boş hücreler arasında kendine değmeyen bir yürüyüş oyar. */
function carvePath(
  size: number,
  free: Set<number>,
  minLength: number,
  maxLength: number,
  rng: Rng,
): number[] {
  const startOptions = shuffle([...free], rng);
  const start = startOptions[0];
  if (start === undefined) return [];

  const path = [start];
  const inPath = new Set<number>([start]);

  while (path.length < maxLength) {
    const current = path[path.length - 1] as number;
    const options = shuffle(neighbourCells(current, size), rng).filter(
      (candidate) => free.has(candidate) && !inPath.has(candidate),
    );

    const next = options[0];
    if (next === undefined) break;

    path.push(next);
    inPath.add(next);
  }

  // Uçları yan yana kalan yol oyuncuya iş bırakmaz: tek hamlede
  // bağlanır. Böyle bir yol kısaltılarak değil, tamamen atılarak
  // yeniden denenir.
  if (path.length < minLength) return [];
  const first = path[0] as number;
  const last = path[path.length - 1] as number;
  if (neighbourCells(first, size).includes(last)) return [];

  return path;
}

function build(level: number, seed: number): ConnectPuzzle | null {
  const size = connectSizeForLevel(level);
  const wanted = connectPairsForLevel(level);
  const rng = createRng(seed);

  const free = new Set(Array.from({ length: size * size }, (_, index) => index));
  const solution: number[][] = [];

  for (let color = 0; color < wanted; color += 1) {
    let path: number[] = [];

    for (let attempt = 0; attempt < 24 && path.length === 0; attempt += 1) {
      path = carvePath(size, free, 4, Math.max(4, size + 2), rng);
    }

    if (path.length === 0) break;

    for (const cell of path) free.delete(cell);
    solution.push(path);
  }

  if (solution.length < 2) return null;

  const pairs = solution.map((path, color) => ({
    color,
    a: path[0] as number,
    b: path[path.length - 1] as number,
  }));

  return { size, pairs, solution };
}

export function generateConnect(level: number, seed: number): ConnectPuzzle {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const puzzle = build(level, seed + attempt * 7919);
    if (puzzle !== null) return puzzle;
  }

  // Buraya düşmek için ızgaranın neredeyse hiç yol kaldırmaması
  // gerekir; yine de üreteç boş dönmesin diye en küçük tahtaya inilir.
  return build(1, seed) ?? { size: 4, pairs: [], solution: [] };
}

/**
 * Oyuncunun çizdiği yolları denetler. Her çift uçtan uca bağlı olmalı,
 * adımlar komşu hücrelere gitmeli ve hiçbir hücre iki kez
 * kullanılmamalı.
 */
export function isConnectSolved(
  puzzle: ConnectPuzzle,
  paths: readonly (readonly number[])[],
): boolean {
  if (paths.length !== puzzle.pairs.length) return false;

  const occupied = new Set<number>();

  for (const [index, pair] of puzzle.pairs.entries()) {
    const path = paths[index] ?? [];
    if (path.length < 2) return false;

    const first = path[0] as number;
    const last = path[path.length - 1] as number;
    const endsMatch =
      (first === pair.a && last === pair.b) || (first === pair.b && last === pair.a);
    if (!endsMatch) return false;

    for (const [step, cell] of path.entries()) {
      if (occupied.has(cell)) return false;
      occupied.add(cell);

      if (step === 0) continue;
      if (!neighbourCells(path[step - 1] as number, puzzle.size).includes(cell)) return false;
    }
  }

  return true;
}
