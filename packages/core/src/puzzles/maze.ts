import { createRng, shuffle, type Rng } from '../random';

/**
 * Doğru Yolu Seç — labirent.
 *
 * Labirent "kusursuz" üretiliyor: rastgele derinlik öncelikli arama
 * ızgaranın bir kapsayan ağacını çıkarıyor, yani her iki hücre
 * arasında tam olarak bir yol var. Çıkışa ulaşmak her zaman mümkün ve
 * yol tek — çözücü koşturmaya gerek kalmıyor.
 */

/** Duvar yönleri; hücre başına dört bitlik maske. */
export const WALL_NORTH = 1;
export const WALL_EAST = 2;
export const WALL_SOUTH = 4;
export const WALL_WEST = 8;

export type MazePuzzle = {
  readonly size: number;
  /** Hücre başına duvar maskesi; `cells[row * size + column]`. */
  readonly cells: readonly number[];
  readonly start: number;
  readonly exit: number;
  /** Başlangıçtan çıkışa tek yol; ipucu ve testler için. */
  readonly solution: readonly number[];
};

const DIRECTIONS = [
  { delta: -1, wall: WALL_NORTH, opposite: WALL_SOUTH, axis: 'row' as const, step: -1 },
  { delta: 1, wall: WALL_SOUTH, opposite: WALL_NORTH, axis: 'row' as const, step: 1 },
  { delta: -1, wall: WALL_WEST, opposite: WALL_EAST, axis: 'column' as const, step: -1 },
  { delta: 1, wall: WALL_EAST, opposite: WALL_WEST, axis: 'column' as const, step: 1 },
];

export function mazeSizeForLevel(level: number): number {
  return Math.min(9, 4 + Math.floor((level - 1) / 3));
}

type Neighbour = { readonly index: number; readonly wall: number; readonly opposite: number };

function neighboursOf(index: number, size: number): Neighbour[] {
  const row = Math.floor(index / size);
  const column = index % size;
  const result: Neighbour[] = [];

  for (const direction of DIRECTIONS) {
    const nextRow = direction.axis === 'row' ? row + direction.step : row;
    const nextColumn = direction.axis === 'column' ? column + direction.step : column;

    if (nextRow < 0 || nextRow >= size || nextColumn < 0 || nextColumn >= size) continue;

    result.push({
      index: nextRow * size + nextColumn,
      wall: direction.wall,
      opposite: direction.opposite,
    });
  }

  return result;
}

/** Rastgele DFS ile kapsayan ağaç: duvarları yıkarak labirenti açar. */
function carve(size: number, rng: Rng): number[] {
  const cells = Array.from(
    { length: size * size },
    () => WALL_NORTH | WALL_EAST | WALL_SOUTH | WALL_WEST,
  );
  const visited = new Set<number>([0]);
  const stack = [0];

  while (stack.length > 0) {
    const current = stack[stack.length - 1] as number;
    const options = shuffle(neighboursOf(current, size), rng).filter(
      (neighbour) => !visited.has(neighbour.index),
    );

    const next = options[0];
    if (next === undefined) {
      stack.pop();
      continue;
    }

    cells[current] = (cells[current] as number) & ~next.wall;
    cells[next.index] = (cells[next.index] as number) & ~next.opposite;
    visited.add(next.index);
    stack.push(next.index);
  }

  return cells;
}

/** Kusursuz labirentte iki hücre arasındaki tek yolu bulur. */
export function solveMaze(cells: readonly number[], size: number, from: number, to: number) {
  const previous = new Map<number, number>([[from, from]]);
  const queue = [from];

  while (queue.length > 0) {
    const current = queue.shift() as number;
    if (current === to) break;

    for (const neighbour of neighboursOf(current, size)) {
      if (((cells[current] as number) & neighbour.wall) !== 0) continue;
      if (previous.has(neighbour.index)) continue;

      previous.set(neighbour.index, current);
      queue.push(neighbour.index);
    }
  }

  if (!previous.has(to)) return [];

  const path = [to];
  let cursor = to;
  while (cursor !== from) {
    cursor = previous.get(cursor) as number;
    path.push(cursor);
  }

  return path.reverse();
}

/** İki komşu hücre arasında duvar var mı. */
export function isBlocked(
  cells: readonly number[],
  size: number,
  from: number,
  to: number,
): boolean {
  const neighbour = neighboursOf(from, size).find((item) => item.index === to);
  if (neighbour === undefined) return true;

  return ((cells[from] as number) & neighbour.wall) !== 0;
}

export function generateMaze(level: number, seed: number): MazePuzzle {
  const size = mazeSizeForLevel(level);
  const cells = carve(size, createRng(seed));
  const exit = size * size - 1;

  return { size, cells, start: 0, exit, solution: solveMaze(cells, size, 0, exit) };
}
