import { createRng, shuffle, type Rng } from '../random';
import { normalize, type Shape } from './shapes';

/**
 * Parça Birleştir — parçaları boş çerçeveye tam oturtma.
 *
 * Bulmaca yine çözümünden üretiliyor: dikdörtgen, bitişik bölgelere
 * bölünüyor ve her bölge bir parça oluyor. Parçalar dikdörtgeni
 * kesinlikle tam dolduruyor, çünkü zaten ondan kesildiler. Oyuncuya
 * rastgele döndürülmüş hâlleri gösteriliyor.
 */

export type TilingPiece = {
  readonly id: number;
  /** Parçanın kendi hücreleri; sol üst köşeye yaslanmış. */
  readonly cells: Shape;
};

export type TilingPlacement = {
  readonly pieceId: number;
  readonly row: number;
  readonly column: number;
};

export type TilingPuzzle = {
  readonly rows: number;
  readonly columns: number;
  readonly pieces: readonly TilingPiece[];
  /** Üretimdeki yerleşim; ipucu ve testler için. */
  readonly solution: readonly TilingPlacement[];
};

export function tilingShapeForLevel(level: number): {
  rows: number;
  columns: number;
  pieces: number;
} {
  const rows = Math.min(5, 3 + Math.floor((level - 1) / 6));
  const columns = Math.min(5, 3 + Math.floor((level - 1) / 4));
  const pieces = Math.min(5, 2 + Math.floor((level - 1) / 3));

  return { rows, columns, pieces };
}

function neighboursOf(index: number, rows: number, columns: number): number[] {
  const row = Math.floor(index / columns);
  const column = index % columns;
  const result: number[] = [];

  if (row > 0) result.push(index - columns);
  if (row < rows - 1) result.push(index + columns);
  if (column > 0) result.push(index - 1);
  if (column < columns - 1) result.push(index + 1);

  return result;
}

/** Dikdörtgeni `count` bitişik bölgeye böler. */
function partition(rows: number, columns: number, count: number, rng: Rng): number[][] | null {
  const total = rows * columns;
  const owner = new Array<number>(total).fill(-1);
  const regions: number[][] = [];

  const seeds = shuffle(
    Array.from({ length: total }, (_, index) => index),
    rng,
  ).slice(0, count);

  for (const [region, seed] of seeds.entries()) {
    owner[seed] = region;
    regions.push([seed]);
  }

  let remaining = total - count;

  while (remaining > 0) {
    // Küçük bölgeler önce büyür; yoksa ilk bölge tahtayı yutuyor ve
    // geriye tek hücrelik parçalar kalıyor.
    const order = [...regions.keys()].sort((a, b) => {
      const sizeA = (regions[a] as number[]).length;
      const sizeB = (regions[b] as number[]).length;
      return sizeA - sizeB;
    });

    let progressed = false;

    for (const region of order) {
      const frontier = new Set<number>();
      for (const cell of regions[region] as number[]) {
        for (const neighbour of neighboursOf(cell, rows, columns)) {
          if (owner[neighbour] === -1) frontier.add(neighbour);
        }
      }

      if (frontier.size === 0) continue;

      const next = shuffle([...frontier], rng)[0] as number;
      owner[next] = region;
      (regions[region] as number[]).push(next);
      remaining -= 1;
      progressed = true;
      break;
    }

    if (!progressed) return null;
  }

  // Tek hücrelik parça oyun için anlamsız; böyle bir bölüm atılıyor.
  if (regions.some((region) => region.length < 2)) return null;

  return regions;
}

export function generateTiling(level: number, seed: number): TilingPuzzle {
  const { rows, columns, pieces: wanted } = tilingShapeForLevel(level);

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const regions = partition(rows, columns, wanted, createRng(seed + attempt * 7919));
    if (regions === null) continue;

    const pieces: TilingPiece[] = [];
    const solution: TilingPlacement[] = [];

    for (const [id, region] of regions.entries()) {
      const cells = region.map((index) => ({
        x: index % columns,
        y: Math.floor(index / columns),
      }));

      const minX = Math.min(...cells.map((cell) => cell.x));
      const minY = Math.min(...cells.map((cell) => cell.y));

      pieces.push({ id, cells: normalize(cells) });
      solution.push({ pieceId: id, row: minY, column: minX });
    }

    return { rows, columns, pieces, solution };
  }

  // Bölme başarısız olursa en küçük tahtaya inilir; iki parçalı 3×3
  // her zaman bölünebiliyor.
  return generateTiling(1, seed + 1);
}

/** Parça, verilen konumda tahtaya sığıyor ve dolu hücreye denk gelmiyor mu. */
export function canPlaceTile(
  puzzle: Pick<TilingPuzzle, 'rows' | 'columns'>,
  occupied: ReadonlySet<number>,
  cells: Shape,
  row: number,
  column: number,
): boolean {
  for (const cell of cells) {
    const targetRow = row + cell.y;
    const targetColumn = column + cell.x;

    if (targetRow < 0 || targetRow >= puzzle.rows) return false;
    if (targetColumn < 0 || targetColumn >= puzzle.columns) return false;
    if (occupied.has(targetRow * puzzle.columns + targetColumn)) return false;
  }

  return true;
}

/** Parçanın tahtada kapladığı hücreler. */
export function tileCells(columns: number, cells: Shape, row: number, column: number): number[] {
  return cells.map((cell) => (row + cell.y) * columns + (column + cell.x));
}
