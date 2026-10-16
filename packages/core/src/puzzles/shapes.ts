import { createRng, shuffle, type Rng } from '../random';

/**
 * Izgara üzerinde şekiller (poliomino) ve dönüşümleri.
 *
 * Görsel-uzamsal oyunların ortak tabanı: şekil üretme, döndürme,
 * aynalama ve iki şeklin "aynı şekil" olup olmadığını belirleme.
 */

export type Cell = { readonly x: number; readonly y: number };
export type Shape = readonly Cell[];

/** Şekli sol üst köşeye yaslar; karşılaştırmalar bu biçim üzerinden yapılır. */
export function normalize(shape: Shape): Shape {
  if (shape.length === 0) return [];

  const minX = Math.min(...shape.map((cell) => cell.x));
  const minY = Math.min(...shape.map((cell) => cell.y));

  return [...shape]
    .map((cell) => ({ x: cell.x - minX, y: cell.y - minY }))
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

export function shapeKey(shape: Shape): string {
  return normalize(shape)
    .map((cell) => `${cell.x},${cell.y}`)
    .join(' ');
}

/** Saat yönünde 90 derece. */
export function rotate(shape: Shape): Shape {
  return normalize(shape.map((cell) => ({ x: -cell.y, y: cell.x })));
}

export function rotateTimes(shape: Shape, quarters: number): Shape {
  let result = normalize(shape);
  for (let index = 0; index < ((quarters % 4) + 4) % 4; index += 1) {
    result = rotate(result);
  }
  return result;
}

/** Dikey eksende aynalar. */
export function mirror(shape: Shape): Shape {
  return normalize(shape.map((cell) => ({ x: -cell.x, y: cell.y })));
}

/** Şeklin dört dönüşü. */
export function rotations(shape: Shape): Shape[] {
  return [0, 1, 2, 3].map((quarters) => rotateTimes(shape, quarters));
}

/** İki şekil döndürülerek üst üste gelebiliyor mu. */
export function sameUpToRotation(a: Shape, b: Shape): boolean {
  const target = shapeKey(b);
  return rotations(a).some((candidate) => shapeKey(candidate) === target);
}

/**
 * Şekil kiral mi: aynası, hiçbir dönüşle kendisine eşit olmuyor mu.
 * Şekil Döndürme oyunu yalnızca kiral şekiller kullanabilir, aksi
 * halde "ayna" seçeneğinin doğru cevabı olmaz.
 */
export function isChiral(shape: Shape): boolean {
  return !sameUpToRotation(mirror(shape), shape);
}

/** Bitişik hücrelerden rastgele bir şekil büyütür. */
export function growShape(size: number, rng: Rng): Shape {
  const cells: Cell[] = [{ x: 0, y: 0 }];
  const taken = new Set(['0,0']);

  while (cells.length < size) {
    const from = cells[Math.floor(rng() * cells.length)] as Cell;
    const neighbours = shuffle(
      [
        { x: from.x + 1, y: from.y },
        { x: from.x - 1, y: from.y },
        { x: from.x, y: from.y + 1 },
        { x: from.x, y: from.y - 1 },
      ],
      rng,
    );

    const free = neighbours.find((cell) => !taken.has(`${cell.x},${cell.y}`));
    if (free === undefined) continue;

    taken.add(`${free.x},${free.y}`);
    cells.push(free);
  }

  return normalize(cells);
}

/** Verilen tohumdan kiral bir şekil üretir. */
export function generateChiralShape(size: number, seed: number): Shape {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const shape = growShape(size, createRng(seed + attempt * 7919));
    if (isChiral(shape)) return shape;
  }

  // Beş hücreli L şekli kiraldir; güvenli varsayılan.
  return normalize([
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
  ]);
}

/** Şeklin kapladığı kutunun genişlik ve yüksekliği. */
export function boundsOf(shape: Shape): { width: number; height: number } {
  const normalized = normalize(shape);
  return {
    width: Math.max(...normalized.map((cell) => cell.x)) + 1,
    height: Math.max(...normalized.map((cell) => cell.y)) + 1,
  };
}
