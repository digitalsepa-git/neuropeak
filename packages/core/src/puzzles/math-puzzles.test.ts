import { describe, expect, it } from 'vitest';

import { generateNumberSeries } from './number-series';
import { generateQuickMath, type QuickMathDifficulty } from './quick-math';
import { generateTargetNumber, solveTargetNumber } from './target-number';

/**
 * Üreteçlerin ürettiği ifadeleri değerlendirir. Tam parantezli ikili
 * işlemler ve tek bir düz işlem bu dilbilgisine giriyor; eval kullanmak
 * yerine küçük bir ayrıştırıcı yazmak hem güvenli hem yeterli.
 */
function evaluateExpression(input: string, steps?: number[]): number {
  const tokens = input.match(/\d+(?:\.\d+)?|[()+×÷−-]/g) ?? [];
  let position = 0;

  function parseValue(): number {
    const token = tokens[position];

    if (token === '(') {
      position += 1;
      const left = parseValue();
      const operator = tokens[position];
      position += 1;
      const right = parseValue();
      position += 1; // kapanış parantezi

      const combined = (() => {
        switch (operator) {
          case '+':
            return left + right;
          case '−':
          case '-':
            return left - right;
          case '×':
            return left * right;
          case '÷':
            return left / right;
          default:
            throw new Error(`bilinmeyen işlem: ${String(operator)}`);
        }
      })();

      steps?.push(combined);
      return combined;
    }

    position += 1;
    return Number(token);
  }

  const first = parseValue();
  if (position >= tokens.length) return first;

  // Parantezsiz düz işlem: "12 + 7" gibi.
  const operator = tokens[position];
  position += 1;
  const second = parseValue();

  switch (operator) {
    case '+':
      return first + second;
    case '−':
    case '-':
      return first - second;
    case '×':
      return first * second;
    default:
      throw new Error(`bilinmeyen işlem: ${String(operator)}`);
  }
}

describe('Sayı Dizisi üreteci', () => {
  it('doğru cevap şıklar arasında ve şıklar farklı', () => {
    for (let seed = 1; seed <= 300; seed += 1) {
      const puzzle = generateNumberSeries((seed % 12) + 1, seed * 37);

      expect(puzzle.options).toHaveLength(4);
      expect(new Set(puzzle.options).size, `tohum ${seed} tekrar eden şık üretti`).toBe(4);
      expect(puzzle.options[puzzle.correctIndex]).toBe(puzzle.answer);
    }
  });

  it('şıklar negatif değildir', () => {
    for (let seed = 1; seed <= 300; seed += 1) {
      for (const option of generateNumberSeries((seed % 12) + 1, seed * 53).options) {
        expect(option).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('dizi en az dört terim gösterir', () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      expect(generateNumberSeries((seed % 12) + 1, seed).sequence.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('gösterilen dizi cevabı içermez', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const puzzle = generateNumberSeries((seed % 12) + 1, seed * 11);
      expect(puzzle.sequence[puzzle.sequence.length - 1]).not.toBe(puzzle.answer);
    }
  });

  it('seviye yükseldikçe daha fazla kural devreye girer', () => {
    const lowLevelRules = new Set(
      Array.from({ length: 60 }, (_, index) => generateNumberSeries(1, index * 97).rule),
    );
    const highLevelRules = new Set(
      Array.from({ length: 60 }, (_, index) => generateNumberSeries(10, index * 97).rule),
    );

    expect(highLevelRules.size).toBeGreaterThan(lowLevelRules.size);
  });

  it('aynı tohum aynı bulmacayı verir', () => {
    expect(generateNumberSeries(5, 2026)).toEqual(generateNumberSeries(5, 2026));
  });
});

describe('Hedef Sayı üreteci', () => {
  it('üretilen her bulmacanın çözümü vardır', () => {
    for (let level = 1; level <= 12; level += 1) {
      const puzzle = generateTargetNumber(level, level * 7919);
      const solution = solveTargetNumber(puzzle.numbers, puzzle.target);

      expect(solution, `seviye ${level} çözülemiyor`).not.toBeNull();
      expect(puzzle.numbers).toHaveLength(4);
    }
  });

  it('çözücü çözümsüz bulmacayı reddeder', () => {
    // 1, 1, 1, 1 ile 97'ye ulaşmak mümkün değil.
    expect(solveTargetNumber([1, 1, 1, 1], 97)).toBeNull();
    // Aynı sayılarla 4'e ulaşmak mümkün.
    expect(solveTargetNumber([1, 1, 1, 1], 4)).not.toBeNull();
  });

  it('bildirilen çözüm gerçekten hedefe ulaşır', () => {
    for (let level = 1; level <= 10; level += 1) {
      const puzzle = generateTargetNumber(level, level * 104_729);
      const value = evaluateExpression(puzzle.solution);

      expect(Math.abs(value - puzzle.target)).toBeLessThan(1e-6);
    }
  });

  it('çözümün her ara değeri tam sayıdır', () => {
    // Oyun ekranında kesirli ara değer yok: çözücünün bulduğu yol da
    // yalnızca tam bölünmeler içermeli, yoksa bulmaca oynanamaz olur.
    for (let level = 1; level <= 20; level += 1) {
      const puzzle = generateTargetNumber(level, level * 2029);
      const steps: number[] = [];
      evaluateExpression(puzzle.solution, steps);

      for (const step of steps) {
        expect(Number.isInteger(step), `seviye ${level}: ${puzzle.solution}`).toBe(true);
      }
    }
  });

  it('oyunun kurallarıyla üretilen her bulmaca oynanabilir', () => {
    // Üretilen bulmacalar oyun ekranındaki kurallarla (tam bölme) çözülebilmeli.
    for (let level = 1; level <= 20; level += 1) {
      const puzzle = generateTargetNumber(level, level * 31_337);
      expect(solveTargetNumber(puzzle.numbers, puzzle.target)).not.toBeNull();
    }
  });

  it('aynı tohum aynı bulmacayı verir', () => {
    expect(generateTargetNumber(6, 31)).toEqual(generateTargetNumber(6, 31));
  });
});

describe('Hızlı İşlem üreteci', () => {
  const difficulties: QuickMathDifficulty[] = ['easy', 'medium', 'hard'];

  it('doğru cevap şıklar arasında ve şıklar farklı', () => {
    for (const difficulty of difficulties) {
      for (let seed = 1; seed <= 200; seed += 1) {
        const problem = generateQuickMath(difficulty, seed * 29);

        expect(problem.options).toHaveLength(4);
        expect(new Set(problem.options).size).toBe(4);
        expect(problem.options[problem.correctIndex]).toBe(problem.answer);
      }
    }
  });

  it('sonuç her zaman pozitiftir', () => {
    for (const difficulty of difficulties) {
      for (let seed = 1; seed <= 200; seed += 1) {
        expect(generateQuickMath(difficulty, seed * 17).answer).toBeGreaterThan(0);
      }
    }
  });

  it('orta ve zor seviyede anlamsız küçük sorular çıkmaz', () => {
    // "2 − 2" gibi sorular bu seviyelerde zaman kaybı. Toplama ve
    // çıkarmada terimlerin, çarpmada sonucun anlamlı olması beklenir.
    for (const difficulty of ['medium', 'hard'] as QuickMathDifficulty[]) {
      for (let seed = 1; seed <= 300; seed += 1) {
        const problem = generateQuickMath(difficulty, seed * 23);
        const terms = (problem.text.match(/\d+/g) ?? []).map(Number);
        const label = `${difficulty}: ${problem.text}`;

        if (problem.text.includes('×')) {
          expect(problem.answer, label).toBeGreaterThanOrEqual(difficulty === 'medium' ? 4 : 9);
          continue;
        }

        expect(Math.max(...terms), label).toBeGreaterThanOrEqual(difficulty === 'medium' ? 11 : 21);
      }
    }
  });

  it('soru metni gerçekten o cevabı verir', () => {
    for (const difficulty of difficulties) {
      for (let seed = 1; seed <= 100; seed += 1) {
        const problem = generateQuickMath(difficulty, seed * 7);

        expect(evaluateExpression(problem.text)).toBe(problem.answer);
      }
    }
  });

  it('kolay seviyede çarpma çıkmaz', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      expect(generateQuickMath('easy', seed * 3).text).not.toContain('×');
    }
  });
});
