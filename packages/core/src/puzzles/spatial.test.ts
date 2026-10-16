import { describe, expect, it } from 'vitest';

import { PAPER_SIZE, generatePaperFold, patternKey, unfold } from './paper-fold';
import {
  boundsOf,
  generateChiralShape,
  growShape,
  isChiral,
  mirror,
  rotate,
  rotateTimes,
  sameUpToRotation,
  shapeKey,
  type Shape,
} from './shapes';
import { createRng } from '../random';

/**
 * V pentomino: köşegene göre simetrik olduğu için aynası bir dönüşüne
 * eşit — yani kiral değil.
 */
const V_SHAPE: Shape = [
  { x: 0, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 2 },
];

/** L pentomino: aynası (J) hiçbir dönüşle kendisine oturmaz. */
const L_SHAPE: Shape = [
  { x: 0, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: 2 },
  { x: 0, y: 3 },
  { x: 1, y: 3 },
];

const SQUARE: Shape = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
];

describe('şekil dönüşümleri', () => {
  it('normalize şekli köşeye yaslar', () => {
    const moved = L_SHAPE.map((cell) => ({ x: cell.x + 5, y: cell.y + 3 }));
    expect(shapeKey(moved)).toBe(shapeKey(L_SHAPE));
  });

  it('dört dönüş başa döner', () => {
    expect(shapeKey(rotateTimes(L_SHAPE, 4))).toBe(shapeKey(L_SHAPE));
    expect(shapeKey(rotate(rotate(rotate(rotate(L_SHAPE)))))).toBe(shapeKey(L_SHAPE));
  });

  it('döndürme hücre sayısını korur', () => {
    expect(rotate(L_SHAPE)).toHaveLength(L_SHAPE.length);
  });

  it('döndürme kutuyu çevirir', () => {
    const before = boundsOf(L_SHAPE);
    const after = boundsOf(rotate(L_SHAPE));

    expect(after.width).toBe(before.height);
    expect(after.height).toBe(before.width);
  });

  it('iki kez aynalamak başa döner', () => {
    expect(shapeKey(mirror(mirror(L_SHAPE)))).toBe(shapeKey(L_SHAPE));
  });

  it('simetrik şekil kiral değildir', () => {
    expect(isChiral(SQUARE)).toBe(false);
    expect(sameUpToRotation(mirror(SQUARE), SQUARE)).toBe(true);

    // V pentomino köşegen simetrisi yüzünden kiral değil; şekil
    // döndürme oyununda kullanılamaz.
    expect(isChiral(V_SHAPE)).toBe(false);
  });

  it('L şekli kiraldır', () => {
    // L'nin aynası hiçbir dönüşle L'ye oturmaz.
    expect(isChiral(L_SHAPE)).toBe(true);
  });

  it('growShape istenen sayıda bitişik hücre üretir', () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const shape = growShape(5, createRng(seed));

      expect(shape).toHaveLength(5);
      expect(new Set(shape.map((cell) => `${cell.x},${cell.y}`)).size).toBe(5);
    }
  });

  it('generateChiralShape her zaman kiral şekil verir', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const shape = generateChiralShape(5, seed * 31);

      expect(shape).toHaveLength(5);
      expect(isChiral(shape), `tohum ${seed} kiral olmayan şekil verdi`).toBe(true);
    }
  });

  it('aynı tohum aynı şekli verir', () => {
    expect(shapeKey(generateChiralShape(5, 99))).toBe(shapeKey(generateChiralShape(5, 99)));
  });
});

describe('Katla-Aç üreteci', () => {
  it('tek dikey katlamada delik yatayda yansır', () => {
    const pattern = unfold([{ row: 1, column: 0 }], ['vertical']);

    expect(pattern[1]?.[0]).toBe(true);
    expect(pattern[1]?.[PAPER_SIZE - 1]).toBe(true);
    expect(pattern[0]?.[0]).toBe(false);
  });

  it('tek yatay katlamada delik dikeyde yansır', () => {
    const pattern = unfold([{ row: 0, column: 2 }], ['horizontal']);

    expect(pattern[0]?.[2]).toBe(true);
    expect(pattern[PAPER_SIZE - 1]?.[2]).toBe(true);
  });

  it('iki katlamada delik dörde çıkar', () => {
    const pattern = unfold([{ row: 0, column: 0 }], ['vertical', 'horizontal']);
    const holes = pattern.reduce((total, row) => total + row.filter(Boolean).length, 0);

    expect(holes).toBe(4);
    expect(pattern[0]?.[0]).toBe(true);
    expect(pattern[0]?.[3]).toBe(true);
    expect(pattern[3]?.[0]).toBe(true);
    expect(pattern[3]?.[3]).toBe(true);
  });

  it('katlama yoksa delik olduğu yerde kalır', () => {
    const pattern = unfold([{ row: 2, column: 1 }], []);
    const holes = pattern.reduce((total, row) => total + row.filter(Boolean).length, 0);

    expect(holes).toBe(1);
    expect(pattern[2]?.[1]).toBe(true);
  });

  it('doğru cevap şıklar arasında ve şıklar farklı', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const puzzle = generatePaperFold((seed % 10) + 1, seed * 41);

      expect(puzzle.options).toHaveLength(4);
      expect(new Set(puzzle.options.map(patternKey)).size, `tohum ${seed}`).toBe(4);
      expect(puzzle.correctIndex).toBeGreaterThanOrEqual(0);
    }
  });

  it('doğru şık gerçekten açılmış desendir', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const puzzle = generatePaperFold((seed % 10) + 1, seed * 17);
      const expected = unfold(puzzle.punches, puzzle.folds);

      expect(patternKey(puzzle.options[puzzle.correctIndex] as never)).toBe(patternKey(expected));
    }
  });

  it('delikler katlanmış ızgaranın içinde kalır', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const puzzle = generatePaperFold((seed % 10) + 1, seed * 23);

      for (const punch of puzzle.punches) {
        expect(punch.row).toBeLessThan(puzzle.foldedRows);
        expect(punch.column).toBeLessThan(puzzle.foldedColumns);
      }
    }
  });

  it('aynı tohum aynı bulmacayı verir', () => {
    expect(generatePaperFold(5, 2026)).toEqual(generatePaperFold(5, 2026));
  });
});
