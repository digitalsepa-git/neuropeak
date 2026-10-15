import { describe, expect, it } from 'vitest';

import {
  DEFAULT_NORM,
  DEFAULT_SCORING_CONFIG,
  IQ_MAX,
  IQ_MIN,
  bandForIq,
  dimensionOf,
  scoreTest,
  type AnsweredQuestion,
  type QuestionKind,
} from './score';

function answer(overrides: Partial<AnsweredQuestion> & { questionId: string }): AnsweredQuestion {
  return {
    kind: 'logic',
    difficultyWeight: 1,
    isCorrect: true,
    elapsedMs: DEFAULT_SCORING_CONFIG.targetMsPerQuestion,
    ...overrides,
  };
}

function answers(count: number, build: (index: number) => Partial<AnsweredQuestion>) {
  return Array.from({ length: count }, (_, index) =>
    answer({ questionId: `q${index}`, ...build(index) }),
  );
}

describe('scoreTest', () => {
  it('hepsi doğru ve anında cevaplanınca çok yüksek skor verir', () => {
    const result = scoreTest(answers(20, () => ({ isCorrect: true, elapsedMs: 0 })));

    // Kusursuz performans norm ortalamasının 2,5 standart sapma üstüdür:
    // 100 + 15 × 2,5 = 137,5. Tavana ancak daha zorlu normlarda ulaşılır.
    expect(result.iq).toBe(138);
    expect(result.iq).toBeLessThanOrEqual(IQ_MAX);
    expect(result.percentile).toBeGreaterThan(99);
    expect(result.correctCount).toBe(20);
    expect(result.band).toBe('exceptional');
  });

  it('hepsi yanlışsa taban skoru verir', () => {
    const result = scoreTest(answers(20, () => ({ isCorrect: false })));

    expect(result.iq).toBe(IQ_MIN);
    expect(result.correctCount).toBe(0);
    expect(result.rawScore).toBe(0);
  });

  it('norm ortalamasındaki başarı 100 civarında skor verir', () => {
    // Hız bonusu olmadan tam olarak norm ortalaması kadar doğru.
    const total = 100;
    const correct = Math.round(
      DEFAULT_NORM.mean * total * (1 + DEFAULT_SCORING_CONFIG.timeBonusWeight),
    );

    const result = scoreTest(
      answers(total, (index) => ({
        isCorrect: index < correct,
        elapsedMs: DEFAULT_SCORING_CONFIG.targetMsPerQuestion,
      })),
    );

    expect(result.iq).toBeGreaterThanOrEqual(98);
    expect(result.iq).toBeLessThanOrEqual(102);
  });

  it('hız bonusu aynı doğru sayısında skoru yükseltir', () => {
    const slow = scoreTest(
      answers(20, (index) => ({
        isCorrect: index < 12,
        elapsedMs: DEFAULT_SCORING_CONFIG.targetMsPerQuestion,
      })),
    );
    const fast = scoreTest(answers(20, (index) => ({ isCorrect: index < 12, elapsedMs: 1_000 })));

    expect(fast.iq).toBeGreaterThan(slow.iq);
    expect(fast.correctCount).toBe(slow.correctCount);
  });

  it('zor soruyu bilmek kolay soruyu bilmekten çok getirir', () => {
    const easyOnly = scoreTest([
      answer({ questionId: 'a', difficultyWeight: 0.5, isCorrect: true }),
      answer({ questionId: 'b', difficultyWeight: 2.5, isCorrect: false }),
    ]);
    const hardOnly = scoreTest([
      answer({ questionId: 'a', difficultyWeight: 0.5, isCorrect: false }),
      answer({ questionId: 'b', difficultyWeight: 2.5, isCorrect: true }),
    ]);

    expect(hardOnly.iq).toBeGreaterThan(easyOnly.iq);
  });

  it('skoru her zaman geçerli aralıkta tutar', () => {
    const extreme = scoreTest(
      answers(5, () => ({ isCorrect: true, elapsedMs: 0 })),
      {
        mean: 0.01,
        sd: 0.01,
      },
    );

    expect(extreme.iq).toBeLessThanOrEqual(IQ_MAX);
    expect(extreme.iq).toBeGreaterThanOrEqual(IQ_MIN);
    expect(extreme.percentile).toBeLessThanOrEqual(100);
  });

  it('boş oturumda çökmez', () => {
    const result = scoreTest([]);

    expect(result.answeredCount).toBe(0);
    expect(result.iq).toBe(IQ_MIN);
    expect(result.subscores).toEqual({});
  });

  it('süreyi cevap sürelerinin toplamı olarak bildirir', () => {
    const result = scoreTest(answers(3, () => ({ elapsedMs: 5_000 })));

    expect(result.durationMs).toBe(15_000);
  });
});

describe('alt boyutlar', () => {
  it('yeterli soru olan boyutları raporlar', () => {
    const result = scoreTest([
      answer({ questionId: 'v1', kind: 'verbal_analogy', isCorrect: true }),
      answer({ questionId: 'v2', kind: 'verbal_analogy', isCorrect: true }),
      answer({ questionId: 'n1', kind: 'number_series', isCorrect: false }),
      answer({ questionId: 'n2', kind: 'arithmetic', isCorrect: false }),
    ]);

    expect(result.subscores.verbal).toBeDefined();
    expect(result.subscores.numeric).toBeDefined();
    expect(result.subscores.verbal as number).toBeGreaterThan(result.subscores.numeric as number);
  });

  it('tek soruluk boyutu raporlamaz', () => {
    const result = scoreTest([
      answer({ questionId: 'v1', kind: 'verbal_analogy' }),
      answer({ questionId: 'l1', kind: 'logic' }),
      answer({ questionId: 'l2', kind: 'odd_one_out' }),
    ]);

    expect(result.subscores.verbal).toBeUndefined();
    expect(result.subscores.logical).toBeDefined();
  });

  it('her soru türünü bir boyuta eşler', () => {
    const kinds: QuestionKind[] = [
      'matrix',
      'number_series',
      'shape_analogy',
      'verbal_analogy',
      'logic',
      'spatial',
      'coding',
      'odd_one_out',
      'arithmetic',
    ];

    for (const kind of kinds) {
      expect(dimensionOf(kind)).toBeDefined();
    }
  });
});

describe('bandForIq', () => {
  it('skoru doğru aralığa yerleştirir', () => {
    expect(bandForIq(70)).toBe('developing');
    expect(bandForIq(84)).toBe('developing');
    expect(bandForIq(85)).toBe('average');
    expect(bandForIq(99)).toBe('average');
    expect(bandForIq(100)).toBe('aboveAverage');
    expect(bandForIq(114)).toBe('aboveAverage');
    expect(bandForIq(115)).toBe('superior');
    expect(bandForIq(129)).toBe('superior');
    expect(bandForIq(130)).toBe('exceptional');
  });
});
