import { describe, expect, it } from 'vitest';

import {
  EMPTY_GAME_RECORD,
  gameRecord,
  hasPlayed,
  pickSuggestedGame,
  playedGameCount,
  recentlyPlayed,
  recordGameResult,
  resumeLevel,
  type GameProgress,
} from './game-progress';

const LEVELS = { mode: 'levels', totalLevels: 240 } as const;
const TIMED = { mode: 'timed', totalLevels: 0 } as const;

describe('gameRecord', () => {
  it('hiç oynanmamış oyun için boş kayıt döner', () => {
    expect(gameRecord({}, 'maze')).toEqual(EMPTY_GAME_RECORD);
    expect(hasPlayed({}, 'maze')).toBe(false);
  });
});

describe('recordGameResult', () => {
  it('ilk turu kaydeder', () => {
    const progress = recordGameResult({}, 'maze', { level: 4, score: 120, date: '2026-03-01' });

    expect(progress.maze).toEqual({
      best: 4,
      bestScore: 120,
      plays: 1,
      lastPlayed: '2026-03-01',
    });
  });

  it('kötü bir tur ulaşılmış seviyeyi geri almıyor', () => {
    let progress: GameProgress = {};
    progress = recordGameResult(progress, 'maze', { level: 9, score: 300, date: '2026-03-01' });
    progress = recordGameResult(progress, 'maze', { level: 2, score: 40, date: '2026-03-02' });

    expect(progress.maze?.best).toBe(9);
    expect(progress.maze?.bestScore).toBe(300);
    expect(progress.maze?.plays).toBe(2);
    // Oynama günü en iyiyi değil son turu izliyor.
    expect(progress.maze?.lastPlayed).toBe('2026-03-02');
  });

  it('diğer oyunların kaydına dokunmuyor', () => {
    const before = recordGameResult({}, 'maze', { level: 3, score: 10, date: '2026-03-01' });
    const after = recordGameResult(before, 'stroop', { level: 20, score: 80, date: '2026-03-01' });

    expect(after.maze).toEqual(before.maze);
    expect(after.stroop?.best).toBe(20);
  });

  it('bozuk değerleri kayda sokmuyor', () => {
    const progress = recordGameResult({}, 'maze', { level: -3, score: 12.7, date: '2026-03-01' });

    expect(progress.maze?.best).toBe(0);
    expect(progress.maze?.bestScore).toBe(12);
  });
});

describe('resumeLevel', () => {
  it('süreli oyunlar her tur baştan başlar', () => {
    const record = { best: 46, bestScore: 900, plays: 5, lastPlayed: '2026-03-01' };
    expect(resumeLevel(record, TIMED)).toBe(1);
  });

  it('hiç oynanmamış seviyeli oyun birinci seviyeden başlar', () => {
    expect(resumeLevel(EMPTY_GAME_RECORD, LEVELS)).toBe(1);
  });

  it('kalınan seviyeden devam eder', () => {
    const record = { best: 37, bestScore: 500, plays: 9, lastPlayed: '2026-03-01' };
    expect(resumeLevel(record, LEVELS)).toBe(37);
  });

  it('katalogdaki son seviyenin ötesine geçmiyor', () => {
    const record = { best: 999, bestScore: 500, plays: 9, lastPlayed: '2026-03-01' };
    expect(resumeLevel(record, LEVELS)).toBe(240);
  });

  it('toplam seviyesi bilinmeyen seviyeli oyunu sınırlamıyor', () => {
    const record = { best: 300, bestScore: 1, plays: 1, lastPlayed: '2026-03-01' };
    expect(resumeLevel(record, { mode: 'levels', totalLevels: 0 })).toBe(300);
  });
});

describe('playedGameCount', () => {
  it('yalnızca oynanmışları sayar', () => {
    const progress: GameProgress = {
      maze: { best: 3, bestScore: 10, plays: 2, lastPlayed: '2026-03-01' },
      stroop: EMPTY_GAME_RECORD,
    };

    expect(playedGameCount(progress)).toBe(1);
  });
});

describe('recentlyPlayed', () => {
  const progress: GameProgress = {
    maze: { best: 3, bestScore: 10, plays: 2, lastPlayed: '2026-03-01' },
    stroop: { best: 20, bestScore: 80, plays: 7, lastPlayed: '2026-03-05' },
    anagram: { best: 5, bestScore: 40, plays: 1, lastPlayed: '2026-03-05' },
    connect: EMPTY_GAME_RECORD,
  };

  it('en son oynanandan eskiye sıralar', () => {
    // Aynı günde iki oyun var; çok oynanan önde.
    expect(recentlyPlayed(progress, 5)).toEqual(['stroop', 'anagram', 'maze']);
  });

  it('hiç oynanmamışları listelemez', () => {
    expect(recentlyPlayed(progress, 5)).not.toContain('connect');
  });

  it('istenen sayıda döner', () => {
    expect(recentlyPlayed(progress, 2)).toEqual(['stroop', 'anagram']);
    expect(recentlyPlayed(progress, 0)).toEqual([]);
  });
});

describe('pickSuggestedGame', () => {
  const ids = ['maze', 'stroop', 'anagram', 'connect'];
  const seed = { userId: 'device-1', dateKey: '2026-03-05' };

  it('denenmemiş bir oyun önerir', () => {
    const progress: GameProgress = {
      maze: { best: 3, bestScore: 10, plays: 2, lastPlayed: '2026-03-01' },
      stroop: { best: 20, bestScore: 80, plays: 7, lastPlayed: '2026-03-05' },
    };

    expect(['anagram', 'connect']).toContain(pickSuggestedGame(ids, progress, seed));
  });

  it('gün içinde değişmiyor, ertesi gün yenileniyor', () => {
    const first = pickSuggestedGame(ids, {}, seed);
    expect(pickSuggestedGame(ids, {}, seed)).toBe(first);

    // Dört oyundan biri seçiliyor; farklı günlerin hepsinin farklı
    // çıkması garanti değil, ama tohumun güne bağlı olması gerekiyor.
    const week = ['06', '07', '08', '09', '10', '11', '12'].map((day) =>
      pickSuggestedGame(ids, {}, { ...seed, dateKey: `2026-03-${day}` }),
    );
    expect(new Set(week).size).toBeGreaterThan(1);
  });

  it('başka bir oyun oynanınca değişmiyor', () => {
    const before = pickSuggestedGame(ids, {}, seed);
    expect(before).toBeDefined();

    // Önerilen oyun dışında bir oyun oynandı; öneri yerinde kalmalı.
    const other = ids.find((id) => id !== before) as string;
    const progress = recordGameResult({}, other, { level: 3, score: 10, date: '2026-03-05' });

    expect(pickSuggestedGame(ids, progress, seed)).toBe(before);
  });

  it('önerilen oyun oynanınca sıradakine geçiyor', () => {
    const first = pickSuggestedGame(ids, {}, seed) as string;
    const progress = recordGameResult({}, first, { level: 3, score: 10, date: '2026-03-05' });

    const second = pickSuggestedGame(ids, progress, seed);
    expect(second).toBeDefined();
    expect(second).not.toBe(first);
  });

  it('hepsi oynanmışsa en uzun süre dönülmeyeni önerir', () => {
    const progress: GameProgress = {
      maze: { best: 3, bestScore: 10, plays: 2, lastPlayed: '2026-02-20' },
      stroop: { best: 20, bestScore: 80, plays: 7, lastPlayed: '2026-03-05' },
      anagram: { best: 5, bestScore: 40, plays: 1, lastPlayed: '2026-03-01' },
      connect: { best: 2, bestScore: 5, plays: 1, lastPlayed: '2026-03-04' },
    };

    expect(pickSuggestedGame(ids, progress, seed)).toBe('maze');
  });

  it('oyun yoksa öneri de yok', () => {
    expect(pickSuggestedGame([], {}, seed)).toBeUndefined();
  });
});
