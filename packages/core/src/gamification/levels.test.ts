import { describe, expect, it } from 'vitest';

import { MAX_LEVEL, levelForXp, levelProgress, totalXpForLevel } from './levels';

describe('seviye eğrisi', () => {
  it('birinci seviye sıfır XP ile başlar', () => {
    expect(totalXpForLevel(1)).toBe(0);
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(-50)).toBe(1);
  });

  it('eğri monoton artar', () => {
    for (let level = 2; level <= MAX_LEVEL; level += 1) {
      expect(totalXpForLevel(level)).toBeGreaterThan(totalXpForLevel(level - 1));
    }
  });

  it('her seviye bir öncekinden daha uzun sürer', () => {
    for (let level = 3; level <= 50; level += 1) {
      const thisSpan = totalXpForLevel(level) - totalXpForLevel(level - 1);
      const previousSpan = totalXpForLevel(level - 1) - totalXpForLevel(level - 2);
      expect(thisSpan).toBeGreaterThanOrEqual(previousSpan);
    }
  });

  it('levelForXp eğriyle tutarlı', () => {
    for (let level = 1; level <= MAX_LEVEL; level += 1) {
      const required = totalXpForLevel(level);
      expect(levelForXp(required)).toBe(level);
      if (level > 1) {
        expect(levelForXp(required - 1)).toBe(level - 1);
      }
    }
  });

  it('ilk seviyeler birkaç oyunda geçilir', () => {
    // Bir oyun turu ~10-25 XP; 2. seviye birkaç turda gelmeli.
    expect(totalXpForLevel(2)).toBeLessThanOrEqual(100);
  });

  it('son seviyede sınırlar korunur', () => {
    const progress = levelProgress(totalXpForLevel(MAX_LEVEL) * 10);

    expect(progress.level).toBe(MAX_LEVEL);
    expect(progress.isMaxLevel).toBe(true);
    expect(progress.ratio).toBe(1);
  });
});

describe('levelProgress', () => {
  it('seviye başında sıfır, sonunda bire yaklaşır', () => {
    const start = levelProgress(totalXpForLevel(5));
    expect(start.level).toBe(5);
    expect(start.xpIntoLevel).toBe(0);
    expect(start.ratio).toBe(0);

    const almost = levelProgress(totalXpForLevel(6) - 1);
    expect(almost.level).toBe(5);
    expect(almost.ratio).toBeGreaterThan(0.9);
  });

  it('oran her zaman [0, 1] aralığında', () => {
    for (let xp = 0; xp < 50_000; xp += 137) {
      const progress = levelProgress(xp);
      expect(progress.ratio).toBeGreaterThanOrEqual(0);
      expect(progress.ratio).toBeLessThanOrEqual(1);
    }
  });
});
