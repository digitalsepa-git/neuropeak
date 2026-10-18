import { describe, expect, it } from 'vitest';

import {
  attributeOf,
  attributeRule,
  figureKey,
  hasDiscoverableRule,
  sameFigure,
  type ContentFigure,
  type GlyphShape,
} from './figures';

function cell(shape: GlyphShape, count = 1): ContentFigure {
  return {
    glyphs: Array.from({ length: count }, () => ({
      shape,
      fill: 'solid' as const,
      tone: 'primary' as const,
    })),
  };
}

describe('şekil kimliği', () => {
  it('aynı şekiller eşit sayılır', () => {
    expect(sameFigure(cell('circle'), cell('circle'))).toBe(true);
  });

  it('simge sayısı farkı şekli farklı yapar', () => {
    expect(sameFigure(cell('circle'), cell('circle', 2))).toBe(false);
  });

  it('dönüş açısı kimliğe giriyor', () => {
    const a: ContentFigure = { glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary' }] };
    const b: ContentFigure = {
      glyphs: [{ shape: 'triangle', fill: 'solid', tone: 'primary', rotation: 90 }],
    };
    expect(figureKey(a)).not.toBe(figureKey(b));
  });

  it('dönüşü yazılmamış şekil sıfır derece sayılır', () => {
    const a: ContentFigure = { glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary' }] };
    const b: ContentFigure = {
      glyphs: [{ shape: 'square', fill: 'solid', tone: 'primary', rotation: 0 }],
    };
    expect(sameFigure(a, b)).toBe(true);
  });
});

describe('özellik okuma', () => {
  it('sayı simge adedinden gelir', () => {
    expect(attributeOf(cell('star', 3), 'count')).toBe('3');
  });

  it('boş hücre çökertmez', () => {
    expect(attributeOf({ glyphs: [] }, 'shape')).toBe('none');
  });
});

describe('matris kuralı', () => {
  const shapes: GlyphShape[] = ['circle', 'square', 'triangle'];

  it('satır boyunca sabit özellik tanınır', () => {
    const grid = [0, 1, 2].flatMap((row) => [0, 1, 2].map(() => cell(shapes[row] as GlyphShape)));
    expect(attributeRule(grid, 'shape')).toBe('constant-in-row');
  });

  it('sütun boyunca sabit özellik tanınır', () => {
    const grid = [0, 1, 2].flatMap(() =>
      [0, 1, 2].map((column) => cell(shapes[column] as GlyphShape)),
    );
    expect(attributeRule(grid, 'shape')).toBe('constant-in-column');
  });

  it('latin kare tanınır', () => {
    const grid = [0, 1, 2].flatMap((row) =>
      [0, 1, 2].map((column) => cell(shapes[(row + column) % 3] as GlyphShape)),
    );
    expect(attributeRule(grid, 'shape')).toBe('latin');
  });

  it('tek değerli özellik sabit sayılır ama kural vermez', () => {
    // Hepsi aynı: cevabı bulmaya yardım etmiyor ama cevabı bağlıyor.
    const grid = Array.from({ length: 9 }, () => cell('circle'));
    expect(attributeRule(grid, 'shape')).toBe('constant');
    expect(hasDiscoverableRule(grid)).toBe(false);
  });

  it('rastgele dağılım kural vermez', () => {
    const order: GlyphShape[] = [
      'circle',
      'square',
      'circle',
      'triangle',
      'circle',
      'square',
      'square',
      'square',
      'circle',
    ];
    const grid = order.map((shape) => cell(shape));
    expect(attributeRule(grid, 'shape')).toBe('none');
    expect(hasDiscoverableRule(grid)).toBe(false);
  });

  it('bir özellik bile kurala uyuyorsa soru çözülebilir', () => {
    const grid = [0, 1, 2].flatMap((row) =>
      [0, 1, 2].map((column) => cell(shapes[(row + column) % 3] as GlyphShape, row + 1)),
    );
    expect(hasDiscoverableRule(grid)).toBe(true);
  });

  it('dokuz hücresi olmayan ızgara kural vermez', () => {
    expect(attributeRule([cell('circle')], 'shape')).toBe('none');
  });
});
