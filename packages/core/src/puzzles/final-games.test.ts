import { describe, expect, it } from 'vitest';

import { generateBalance } from './balance';
import {
  generateGridRecall,
  generateNBack,
  gridRecallCountForLevel,
  gridRecallSizeForLevel,
  nBackLevel,
} from './memory-tasks';
import { shapeKey } from './shapes';
import { canPlaceTile, generateTiling, tileCells, tilingShapeForLevel } from './tiling';
import { BALL_RADIUS, FIELD, generateTracking, stepTracking } from './tracking';

describe('N-Geri üreteci', () => {
  it('eşleşme listesi gerçekten eşleşen indeksleri gösterir', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const n = (seed % 3) + 1;
      const sequence = generateNBack(40, n, seed * 13);

      for (const index of sequence.matches) {
        expect(sequence.symbols[index], `tohum ${seed}`).toBe(sequence.symbols[index - n]);
      }
    }
  });

  it('listede olmayan hiçbir indeks eşleşmez', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const n = (seed % 3) + 1;
      const sequence = generateNBack(40, n, seed * 17);
      const flagged = new Set(sequence.matches);

      for (let index = n; index < sequence.symbols.length; index += 1) {
        if (flagged.has(index)) continue;

        expect(sequence.symbols[index], `tohum ${seed} indeks ${index} kazara eşleşti`).not.toBe(
          sequence.symbols[index - n],
        );
      }
    }
  });

  it('eşleşme oranı hedefe yakın', () => {
    let matches = 0;
    let eligible = 0;

    for (let seed = 1; seed <= 100; seed += 1) {
      const sequence = generateNBack(60, 2, seed * 23);
      matches += sequence.matches.length;
      eligible += sequence.symbols.length - 2;
    }

    const rate = matches / eligible;
    expect(rate).toBeGreaterThan(0.22);
    expect(rate).toBeLessThan(0.38);
  });

  it('istenen uzunlukta dizi verir', () => {
    expect(generateNBack(25, 2, 7).symbols).toHaveLength(25);
  });

  it('seri uzadıkça n büyür', () => {
    expect(nBackLevel(0)).toBe(1);
    expect(nBackLevel(8)).toBe(2);
    expect(nBackLevel(100)).toBe(4);
  });

  it('aynı tohum aynı diziyi verir', () => {
    expect(generateNBack(30, 2, 2026)).toEqual(generateNBack(30, 2, 2026));
  });
});

describe('Nerede Kaldı? üreteci', () => {
  it('hücreler ızgaranın içinde ve tekrarsız', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const level = (seed % 20) + 1;
      const puzzle = generateGridRecall(level, seed * 29);

      expect(new Set(puzzle.cells).size, `tohum ${seed}`).toBe(puzzle.cells.length);
      for (const cell of puzzle.cells) {
        expect(cell).toBeGreaterThanOrEqual(0);
        expect(cell).toBeLessThan(puzzle.size * puzzle.size);
      }
    }
  });

  it('istenen sayıda hücre işaretler', () => {
    for (let level = 1; level <= 20; level += 1) {
      const puzzle = generateGridRecall(level, level * 31);
      expect(puzzle.cells).toHaveLength(gridRecallCountForLevel(level));
    }
  });

  it('işaretli hücreler ızgaranın üçte birini geçmez', () => {
    for (let level = 1; level <= 40; level += 1) {
      const size = gridRecallSizeForLevel(level);
      expect(gridRecallCountForLevel(level)).toBeLessThanOrEqual((size * size) / 3);
    }
  });

  it('aynı tohum aynı deseni verir', () => {
    expect(generateGridRecall(5, 2026)).toEqual(generateGridRecall(5, 2026));
  });
});

describe('Çoklu Takip', () => {
  it('toplar alanın içinde başlar', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      for (const ball of generateTracking((seed % 20) + 1, seed * 11).balls) {
        expect(ball.x).toBeGreaterThanOrEqual(BALL_RADIUS - 1e-9);
        expect(ball.x).toBeLessThanOrEqual(FIELD - BALL_RADIUS + 1e-9);
        expect(ball.y).toBeGreaterThanOrEqual(BALL_RADIUS - 1e-9);
        expect(ball.y).toBeLessThanOrEqual(FIELD - BALL_RADIUS + 1e-9);
      }
    }
  });

  it('uzun simülasyonda hiçbir top alandan çıkmaz', () => {
    let balls = generateTracking(15, 99).balls;

    for (let step = 0; step < 2000; step += 1) {
      balls = stepTracking(balls, 1 / 60);

      for (const ball of balls) {
        expect(ball.x).toBeGreaterThanOrEqual(BALL_RADIUS - 1e-9);
        expect(ball.x).toBeLessThanOrEqual(FIELD - BALL_RADIUS + 1e-9);
        expect(ball.y).toBeGreaterThanOrEqual(BALL_RADIUS - 1e-9);
        expect(ball.y).toBeLessThanOrEqual(FIELD - BALL_RADIUS + 1e-9);
      }
    }
  });

  it('duvara çarpan top yön değiştirir', () => {
    const [bounced] = stepTracking(
      [{ id: 0, x: BALL_RADIUS + 0.001, y: 0.5, vx: -0.5, vy: 0, isTarget: false }],
      1 / 60,
    );

    expect(bounced?.vx).toBeGreaterThan(0);
  });

  it('hedef sayısı top sayısını geçmez', () => {
    for (let level = 1; level <= 40; level += 1) {
      const round = generateTracking(level, level * 7);
      const targets = round.balls.filter((ball) => ball.isTarget).length;

      expect(targets).toBe(round.targetCount);
      expect(targets).toBeLessThan(round.balls.length);
    }
  });

  it('toplar hareket eder', () => {
    const before = generateTracking(5, 3).balls;
    const after = stepTracking(before, 0.5);

    expect(after.some((ball, index) => ball.x !== (before[index] as (typeof before)[0]).x)).toBe(
      true,
    );
  });
});

describe('Terazi üreteci', () => {
  it('cevap ipuçlarından hesaplanabilir', () => {
    for (let seed = 1; seed <= 300; seed += 1) {
      const puzzle = generateBalance((seed % 20) + 1, seed * 19);
      const weights = new Map(puzzle.hints.map((hint) => [hint.shape, hint.circles]));

      const expected = puzzle.question.reduce(
        (total, shape) => total + (weights.get(shape) ?? Number.NaN),
        0,
      );

      expect(expected, `tohum ${seed} sorusu ipuçlarıyla çözülemiyor`).toBe(puzzle.answer);
    }
  });

  it('doğru cevap şıklar arasında ve şıklar farklı', () => {
    for (let seed = 1; seed <= 300; seed += 1) {
      const puzzle = generateBalance((seed % 20) + 1, seed * 23);

      expect(puzzle.options).toHaveLength(4);
      expect(new Set(puzzle.options).size, `tohum ${seed}`).toBe(4);
      expect(puzzle.options[puzzle.correctIndex]).toBe(puzzle.answer);
      expect(puzzle.options.every((option) => option > 0)).toBe(true);
    }
  });

  it('ipuçlarında her şekil bir kez geçer', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const puzzle = generateBalance((seed % 20) + 1, seed * 29);
      const shapes = puzzle.hints.map((hint) => hint.shape);

      expect(new Set(shapes).size).toBe(shapes.length);
    }
  });

  it('şekil ağırlıkları birden büyük', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      for (const hint of generateBalance((seed % 20) + 1, seed * 31).hints) {
        expect(hint.circles).toBeGreaterThan(1);
      }
    }
  });

  it('aynı tohum aynı bulmacayı verir', () => {
    expect(generateBalance(6, 2026)).toEqual(generateBalance(6, 2026));
  });
});

describe('Parça Birleştir üreteci', () => {
  it('çözüm dikdörtgeni tam doldurur', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const puzzle = generateTiling((seed % 20) + 1, seed * 13);
      const covered: number[] = [];

      for (const placement of puzzle.solution) {
        const piece = puzzle.pieces.find((item) => item.id === placement.pieceId);
        expect(piece, `tohum ${seed} eksik parça`).toBeDefined();

        covered.push(
          ...tileCells(
            puzzle.columns,
            (piece as (typeof puzzle.pieces)[number]).cells,
            placement.row,
            placement.column,
          ),
        );
      }

      const cellCount = puzzle.rows * puzzle.columns;
      expect(covered, `tohum ${seed} hücre sayısı`).toHaveLength(cellCount);
      expect(new Set(covered).size, `tohum ${seed} çakışan parça`).toBe(cellCount);
    }
  });

  it('her parça en az iki hücreli', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const puzzle = generateTiling((seed % 20) + 1, seed * 17);

      for (const piece of puzzle.pieces) {
        expect(piece.cells.length, `tohum ${seed}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('parça hücreleri bitişik', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const puzzle = generateTiling((seed % 20) + 1, seed * 19);

      for (const piece of puzzle.pieces) {
        const keys = new Set(piece.cells.map((cell) => `${cell.x},${cell.y}`));
        const start = piece.cells[0] as (typeof piece.cells)[number];
        const seen = new Set([`${start.x},${start.y}`]);
        const stack = [start];

        while (stack.length > 0) {
          const cell = stack.pop() as (typeof piece.cells)[number];
          const around = [
            { x: cell.x + 1, y: cell.y },
            { x: cell.x - 1, y: cell.y },
            { x: cell.x, y: cell.y + 1 },
            { x: cell.x, y: cell.y - 1 },
          ];

          for (const next of around) {
            const key = `${next.x},${next.y}`;
            if (!keys.has(key) || seen.has(key)) continue;
            seen.add(key);
            stack.push(next);
          }
        }

        expect(seen.size, `tohum ${seed} kopuk parça`).toBe(piece.cells.length);
      }
    }
  });

  it('parça sayısı seviyeye uyar', () => {
    for (let level = 1; level <= 20; level += 1) {
      const puzzle = generateTiling(level, level * 41);
      expect(puzzle.pieces).toHaveLength(tilingShapeForLevel(level).pieces);
    }
  });

  it('canPlaceTile tahta dışını ve dolu hücreyi reddeder', () => {
    const puzzle = generateTiling(1, 5);
    const piece = puzzle.pieces[0] as (typeof puzzle.pieces)[number];
    const placement = puzzle.solution[0] as (typeof puzzle.solution)[number];

    expect(canPlaceTile(puzzle, new Set(), piece.cells, placement.row, placement.column)).toBe(
      true,
    );
    expect(canPlaceTile(puzzle, new Set(), piece.cells, puzzle.rows, 0)).toBe(false);

    const occupied = new Set(
      tileCells(puzzle.columns, piece.cells, placement.row, placement.column),
    );
    expect(canPlaceTile(puzzle, occupied, piece.cells, placement.row, placement.column)).toBe(
      false,
    );
  });

  it('aynı tohum aynı parçaları verir', () => {
    const first = generateTiling(7, 2026);
    const second = generateTiling(7, 2026);

    expect(first.pieces.map((piece) => shapeKey(piece.cells))).toEqual(
      second.pieces.map((piece) => shapeKey(piece.cells)),
    );
  });
});
