import { describe, expect, it } from 'vitest';

import {
  connectPairsForLevel,
  connectSizeForLevel,
  generateConnect,
  isConnectSolved,
  neighbourCells,
} from './connect';
import { generateMaze, isBlocked, mazeSizeForLevel, solveMaze } from './maze';
import { edgeKey, generateOneLine, hasEulerPath } from './one-line';
import { generateQuickDecision, type QuickDecisionDifficulty } from './quick-decision';

describe('Tek Çizgi üreteci', () => {
  it('her tahtada Euler yolu var', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const puzzle = generateOneLine((seed % 20) + 1, seed * 13);

      expect(hasEulerPath(puzzle), `tohum ${seed} çözülemez tahta verdi`).toBe(true);
    }
  });

  it('aynı kenar iki kez çizilmez', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const puzzle = generateOneLine((seed % 20) + 1, seed * 29);
      const keys = puzzle.edges.map((edge) => edgeKey(edge.a, edge.b));

      expect(new Set(keys).size, `tohum ${seed}`).toBe(keys.length);
    }
  });

  it('kenarlar yalnızca komşu düğümleri bağlar', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const puzzle = generateOneLine((seed % 20) + 1, seed * 31);

      for (const edge of puzzle.edges) {
        const columnA = edge.a % puzzle.columns;
        const columnB = edge.b % puzzle.columns;
        const rowA = Math.floor(edge.a / puzzle.columns);
        const rowB = Math.floor(edge.b / puzzle.columns);
        const distance = Math.abs(columnA - columnB) + Math.abs(rowA - rowB);

        expect(distance, `tohum ${seed} komşu olmayan kenar`).toBe(1);
      }
    }
  });

  it('düğüm listesi kenarı olan noktalardan oluşur', () => {
    const puzzle = generateOneLine(10, 4242);
    const used = new Set(puzzle.edges.flatMap((edge) => [edge.a, edge.b]));

    expect([...puzzle.nodes].sort((a, b) => a - b)).toEqual([...used].sort((a, b) => a - b));
  });

  it('seviye yükseldikçe tahta büyür', () => {
    expect(generateOneLine(20, 5).edges.length).toBeGreaterThan(generateOneLine(1, 5).edges.length);
  });

  it('aynı tohum aynı tahtayı verir', () => {
    expect(generateOneLine(7, 2026)).toEqual(generateOneLine(7, 2026));
  });
});

describe('Labirent üreteci', () => {
  it('çıkışa her zaman ulaşılır', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const maze = generateMaze((seed % 20) + 1, seed * 17);

      expect(maze.solution.length, `tohum ${seed} çıkışsız labirent verdi`).toBeGreaterThan(0);
      expect(maze.solution[0]).toBe(maze.start);
      expect(maze.solution[maze.solution.length - 1]).toBe(maze.exit);
    }
  });

  it('çözüm yolu duvardan geçmez', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const maze = generateMaze((seed % 20) + 1, seed * 23);

      for (let step = 1; step < maze.solution.length; step += 1) {
        const from = maze.solution[step - 1] as number;
        const to = maze.solution[step] as number;

        expect(isBlocked(maze.cells, maze.size, from, to), `tohum ${seed} duvardan geçti`).toBe(
          false,
        );
      }
    }
  });

  it('labirent kusursuz: her hücreye tam bir yol var', () => {
    const maze = generateMaze(12, 99);
    const cellCount = maze.size * maze.size;

    // Kapsayan ağaçta kenar sayısı hücre sayısının bir eksiğidir.
    let openings = 0;
    for (let index = 0; index < cellCount; index += 1) {
      for (const neighbour of [index + 1, index + maze.size]) {
        if (neighbour % maze.size === 0 && neighbour === index + 1) continue;
        if (neighbour >= cellCount) continue;
        if (!isBlocked(maze.cells, maze.size, index, neighbour)) openings += 1;
      }
    }

    expect(openings).toBe(cellCount - 1);
  });

  it('her hücreye ulaşılabilir', () => {
    const maze = generateMaze(12, 7);

    for (let index = 0; index < maze.size * maze.size; index += 1) {
      expect(solveMaze(maze.cells, maze.size, 0, index).length).toBeGreaterThan(0);
    }
  });

  it('seviye yükseldikçe ızgara büyür', () => {
    expect(mazeSizeForLevel(1)).toBe(4);
    expect(mazeSizeForLevel(10)).toBeGreaterThan(mazeSizeForLevel(1));
    expect(mazeSizeForLevel(100)).toBe(9);
  });

  it('aynı tohum aynı labirenti verir', () => {
    expect(generateMaze(5, 2026)).toEqual(generateMaze(5, 2026));
  });
});

describe('Bağlantı üreteci', () => {
  it('üretilen çözüm kuralları sağlar', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const puzzle = generateConnect((seed % 20) + 1, seed * 19);

      expect(isConnectSolved(puzzle, puzzle.solution), `tohum ${seed}`).toBe(true);
    }
  });

  it('en az iki çift çıkarır', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const puzzle = generateConnect((seed % 20) + 1, seed * 37);

      expect(puzzle.pairs.length, `tohum ${seed}`).toBeGreaterThanOrEqual(2);
      expect(puzzle.pairs.length).toBeLessThanOrEqual(connectPairsForLevel((seed % 20) + 1));
    }
  });

  it('uçlar yan yana değil: tek hamlede bağlanamaz', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const puzzle = generateConnect((seed % 20) + 1, seed * 41);

      for (const pair of puzzle.pairs) {
        expect(
          neighbourCells(pair.a, puzzle.size).includes(pair.b),
          `tohum ${seed} bitişik uç verdi`,
        ).toBe(false);
      }
    }
  });

  it('uçlar birbirinden farklı hücrelerde', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const puzzle = generateConnect((seed % 20) + 1, seed * 43);
      const ends = puzzle.pairs.flatMap((pair) => [pair.a, pair.b]);

      expect(new Set(ends).size, `tohum ${seed}`).toBe(ends.length);
    }
  });

  it('kesişen çözümü reddeder', () => {
    const puzzle = generateConnect(1, 11);
    const first = puzzle.solution[0] as readonly number[];
    const crossing = puzzle.solution.map((path, index) => (index === 1 ? first : path));

    expect(isConnectSolved(puzzle, crossing)).toBe(false);
  });

  it('kopuk çözümü reddeder', () => {
    const puzzle = generateConnect(1, 13);
    const broken = puzzle.solution.map((path, index) =>
      index === 0 ? [path[0] as number, path[path.length - 1] as number] : path,
    );

    expect(isConnectSolved(puzzle, broken)).toBe(false);
  });

  it('seviye yükseldikçe ızgara ve çift sayısı artar', () => {
    expect(connectSizeForLevel(20)).toBeGreaterThan(connectSizeForLevel(1));
    expect(connectPairsForLevel(20)).toBeGreaterThan(connectPairsForLevel(1));
  });

  it('aynı tohum aynı tahtayı verir', () => {
    expect(generateConnect(6, 2026)).toEqual(generateConnect(6, 2026));
  });
});

describe('Hızlı Karar üreteci', () => {
  const difficulties: QuickDecisionDifficulty[] = ['easy', 'medium', 'hard'];

  it('doğru cevap gerçekten doğru', () => {
    for (const difficulty of difficulties) {
      for (let seed = 1; seed <= 300; seed += 1) {
        const trial = generateQuickDecision(difficulty, seed * 7);
        const answer = trial.options[trial.correctIndex];

        if (trial.prompt.startsWith('Nokta sayıları')) {
          expect(answer, `${difficulty}/${seed}`).toBe(
            trial.left === trial.right ? 'Aynı' : 'Farklı',
          );
          continue;
        }

        expect(trial.left, `${difficulty}/${seed} eşit küme ile "daha çok" sordu`).not.toBe(
          trial.right,
        );
        expect(answer).toBe(trial.left > trial.right ? 'Sol' : 'Sağ');
      }
    }
  });

  it('kümeler boş değil', () => {
    for (const difficulty of difficulties) {
      for (let seed = 1; seed <= 100; seed += 1) {
        const trial = generateQuickDecision(difficulty, seed * 11);

        expect(trial.left).toBeGreaterThan(0);
        expect(trial.right).toBeGreaterThan(0);
      }
    }
  });

  it('zorluk arttıkça fark daralır', () => {
    const averageGap = (difficulty: QuickDecisionDifficulty) => {
      let total = 0;
      let counted = 0;

      for (let seed = 1; seed <= 400; seed += 1) {
        const trial = generateQuickDecision(difficulty, seed * 3);
        const gap = Math.abs(trial.left - trial.right);
        if (gap === 0) continue;

        total += gap;
        counted += 1;
      }

      return total / counted;
    };

    expect(averageGap('hard')).toBeLessThan(averageGap('medium'));
    expect(averageGap('medium')).toBeLessThan(averageGap('easy'));
  });

  it('iki soru türü de çıkar', () => {
    const prompts = new Set<string>();
    for (let seed = 1; seed <= 100; seed += 1) {
      prompts.add(generateQuickDecision('medium', seed * 5).prompt);
    }

    expect(prompts.size).toBe(2);
  });

  it('aynı tohum aynı soruyu verir', () => {
    expect(generateQuickDecision('medium', 2026)).toEqual(generateQuickDecision('medium', 2026));
  });
});
