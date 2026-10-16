import { describe, expect, it } from 'vitest';

import { BRAIN_AXES } from '../domain/brain-axes';
import {
  HISTORY_DAYS,
  lastDays,
  rankCategories,
  recordCategoryRound,
  recordDayActivity,
  type DayActivity,
} from './activity';
import {
  EMPTY_BRAIN_MAP,
  INITIAL_AXIS_SCORE,
  applyRoundToBrainMap,
  axisForCategory,
  categoriesForAxis,
  neuropeakScore,
  roundPerformance,
  strongestAxis,
  weakestAxis,
} from './brain-map';

describe('tur performansı', () => {
  it('seviye yükseldikçe artar', () => {
    const at = (level: number) =>
      roundPerformance({ mode: 'levels', level, completed: true, difficulty: 'medium' });

    expect(at(5)).toBeGreaterThan(at(2));
    expect(at(10)).toBeGreaterThan(at(5));
  });

  it('0–100 aralığında kalır', () => {
    for (const level of [0, 1, 50, 1000]) {
      for (const difficulty of ['easy', 'medium', 'hard'] as const) {
        const value = roundPerformance({ mode: 'levels', level, completed: true, difficulty });

        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });

  it('yarıda kalan tur yarı değer sayılır', () => {
    const base = { mode: 'levels' as const, level: 5, difficulty: 'medium' as const };

    expect(roundPerformance({ ...base, completed: false })).toBe(
      roundPerformance({ ...base, completed: true }) / 2,
    );
  });

  it('zor seviyede aynı seviye daha çok değer eder', () => {
    const base = { mode: 'levels' as const, level: 5, completed: true };

    expect(roundPerformance({ ...base, difficulty: 'hard' })).toBeGreaterThan(
      roundPerformance({ ...base, difficulty: 'easy' }),
    );
  });
});

describe('beyin haritası', () => {
  it('boş harita bütün eksenlerde aynı başlar', () => {
    for (const axis of BRAIN_AXES) {
      expect(EMPTY_BRAIN_MAP[axis]).toBe(INITIAL_AXIS_SCORE);
    }
  });

  it('yalnızca ilgili ekseni değiştirir', () => {
    const next = applyRoundToBrainMap(EMPTY_BRAIN_MAP, 'memory', 90);

    expect(next.memory).toBeGreaterThan(EMPTY_BRAIN_MAP.memory);
    expect(next.focus).toBe(EMPTY_BRAIN_MAP.focus);
    expect(next.logic).toBe(EMPTY_BRAIN_MAP.logic);
    expect(next.speed).toBe(EMPTY_BRAIN_MAP.speed);
    expect(next.problemSolving).toBe(EMPTY_BRAIN_MAP.problemSolving);
  });

  it('kötü performans ekseni düşürür', () => {
    const next = applyRoundToBrainMap(EMPTY_BRAIN_MAP, 'logic', 10);
    expect(next.logic).toBeLessThan(EMPTY_BRAIN_MAP.logic);
  });

  it('tekrarlanan performansa yakınsar', () => {
    let map = EMPTY_BRAIN_MAP;
    for (let round = 0; round < 60; round += 1) {
      map = applyRoundToBrainMap(map, 'memory', 80);
    }

    expect(Math.abs(map.memory - 80)).toBeLessThanOrEqual(1);
  });

  it('iyi tur hızlı yükseltir, kötü tur yavaş düşürür', () => {
    const up = applyRoundToBrainMap(EMPTY_BRAIN_MAP, 'memory', 90).memory - INITIAL_AXIS_SCORE;
    const down = INITIAL_AXIS_SCORE - applyRoundToBrainMap(EMPTY_BRAIN_MAP, 'memory', 10).memory;

    // İki yönde de 40 puanlık fark var; düşüş belirgin biçimde yavaş.
    expect(up).toBeGreaterThan(down * 3);
  });

  it('tek kötü tur kazanılmış tabloyu silmez', () => {
    let map = EMPTY_BRAIN_MAP;
    for (let round = 0; round < 20; round += 1) {
      map = applyRoundToBrainMap(map, 'memory', 85);
    }

    const earned = map.memory;
    const afterBadRound = applyRoundToBrainMap(map, 'memory', 0).memory;

    expect(afterBadRound).toBeGreaterThan(earned * 0.85);
  });

  it('üst üste kötü turlar ekseni gerçekten düşürür', () => {
    let map = EMPTY_BRAIN_MAP;
    for (let round = 0; round < 20; round += 1) {
      map = applyRoundToBrainMap(map, 'memory', 85);
    }
    for (let round = 0; round < 30; round += 1) {
      map = applyRoundToBrainMap(map, 'memory', 10);
    }

    expect(map.memory).toBeLessThan(25);
  });

  it('eksen puanı 0–100 dışına çıkmaz', () => {
    let map = EMPTY_BRAIN_MAP;
    for (let round = 0; round < 100; round += 1) {
      map = applyRoundToBrainMap(map, 'memory', 100);
      map = applyRoundToBrainMap(map, 'logic', 0);
    }

    expect(map.memory).toBeLessThanOrEqual(100);
    expect(map.logic).toBeGreaterThanOrEqual(0);
  });

  it('kategori doğru eksene yazılır', () => {
    expect(axisForCategory('attention')).toBe('focus');
    expect(axisForCategory('spatial')).toBe('logic');
    expect(axisForCategory('verbal')).toBe('problemSolving');
  });

  it('bir eksenin kategorileri o eksene yazar', () => {
    for (const axis of BRAIN_AXES) {
      for (const category of categoriesForAxis(axis)) {
        expect(axisForCategory(category)).toBe(axis);
      }
    }
  });

  it('NeuroPeak skoru eksenlerin arasında kalır', () => {
    const map = { memory: 90, focus: 40, logic: 70, speed: 20, problemSolving: 60 };
    const score = neuropeakScore(map);

    expect(score).toBeGreaterThanOrEqual(20);
    expect(score).toBeLessThanOrEqual(90);
  });

  it('bütün eksenler aynıysa skor da odur', () => {
    expect(neuropeakScore({ ...EMPTY_BRAIN_MAP })).toBe(INITIAL_AXIS_SCORE);
  });

  it('en zayıf ve en güçlü ekseni bulur', () => {
    const map = { memory: 90, focus: 40, logic: 70, speed: 20, problemSolving: 60 };

    expect(weakestAxis(map)).toBe('speed');
    expect(strongestAxis(map)).toBe('memory');
  });
});

describe('etkinlik geçmişi', () => {
  it('aynı günün kazancını toplar', () => {
    let history: DayActivity[] = [];
    history = recordDayActivity(history, '2026-10-16', { xp: 10, rounds: 1 });
    history = recordDayActivity(history, '2026-10-16', { xp: 5, rounds: 2 });

    expect(history).toHaveLength(1);
    expect(history[0]).toEqual({ date: '2026-10-16', xp: 15, rounds: 3 });
  });

  it('geçmişi iki haftayla sınırlar', () => {
    let history: DayActivity[] = [];
    for (let day = 1; day <= 30; day += 1) {
      const date = `2026-10-${`${day}`.padStart(2, '0')}`;
      history = recordDayActivity(history, date, { xp: day, rounds: 1 });
    }

    expect(history).toHaveLength(HISTORY_DAYS);
    expect(history[history.length - 1]?.date).toBe('2026-10-30');
  });

  it('geçmiş tarihe göre sıralı kalır', () => {
    let history: DayActivity[] = [];
    history = recordDayActivity(history, '2026-10-16', { xp: 1, rounds: 1 });
    history = recordDayActivity(history, '2026-10-14', { xp: 1, rounds: 1 });
    history = recordDayActivity(history, '2026-10-15', { xp: 1, rounds: 1 });

    expect(history.map((day) => day.date)).toEqual(['2026-10-14', '2026-10-15', '2026-10-16']);
  });

  it('oynanmayan günleri sıfırla doldurur', () => {
    const history = recordDayActivity([], '2026-10-16', { xp: 20, rounds: 2 });
    const week = lastDays(history, '2026-10-16', 7);

    expect(week).toHaveLength(7);
    expect(week[6]).toEqual({ date: '2026-10-16', xp: 20, rounds: 2 });
    expect(week[0]).toEqual({ date: '2026-10-10', xp: 0, rounds: 0 });
  });

  it('ay sınırını doğru geçer', () => {
    const week = lastDays([], '2026-11-02', 7);
    expect(week[0]?.date).toBe('2026-10-27');
  });

  it('kategori sayaçları artar ve sıralanır', () => {
    let counts = {};
    counts = recordCategoryRound(counts, 'logic');
    counts = recordCategoryRound(counts, 'logic');
    counts = recordCategoryRound(counts, 'memory');

    expect(rankCategories(counts)).toEqual([
      { category: 'logic', count: 2 },
      { category: 'memory', count: 1 },
    ]);
  });

  it('hiç oynanmamış kategori listede yok', () => {
    expect(rankCategories({ logic: 0 })).toEqual([]);
  });
});
