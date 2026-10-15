import { describe, expect, it } from 'vitest';

import { BASE_GAME_XP, TEST_COMPLETION_XP, xpForGameRound, xpForTestCompletion } from './rewards';

describe('xpForGameRound', () => {
  it('zorluk çarpanını uygular', () => {
    const easy = xpForGameRound({ difficulty: 'easy', completed: true });
    const medium = xpForGameRound({ difficulty: 'medium', completed: true });
    const hard = xpForGameRound({ difficulty: 'hard', completed: true });

    expect(easy).toBe(BASE_GAME_XP);
    expect(medium).toBeGreaterThan(easy);
    expect(hard).toBeGreaterThan(medium);
  });

  it('yarıda bırakılan tur yarım XP verir ama sıfır değil', () => {
    const complete = xpForGameRound({ difficulty: 'medium', completed: true });
    const abandoned = xpForGameRound({ difficulty: 'medium', completed: false });

    expect(abandoned).toBeLessThan(complete);
    expect(abandoned).toBeGreaterThan(0);
  });

  it('oyunun kendi temel değeri geçerli olur', () => {
    expect(xpForGameRound({ baseXp: 40, difficulty: 'easy', completed: true })).toBe(40);
  });

  it('en az 1 XP verir', () => {
    expect(xpForGameRound({ baseXp: 1, difficulty: 'easy', completed: false })).toBe(1);
  });
});

describe('xpForTestCompletion', () => {
  it('düşük skorda bile taban ödülü korur', () => {
    expect(xpForTestCompletion(55)).toBe(TEST_COMPLETION_XP);
  });

  it('skor yükseldikçe artar', () => {
    expect(xpForTestCompletion(130)).toBeGreaterThan(xpForTestCompletion(100));
    expect(xpForTestCompletion(100)).toBeGreaterThan(xpForTestCompletion(80));
  });

  it('artış sınırlı kalır', () => {
    expect(xpForTestCompletion(145)).toBeLessThanOrEqual(TEST_COMPLETION_XP * 1.5);
  });
});
