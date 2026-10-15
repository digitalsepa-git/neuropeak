import { describe, expect, it } from 'vitest';

import { EMPTY_STREAK, isStreakAlive, recordActivity, toDateKey, type StreakState } from './streak';

const MONDAY = '2026-10-12';
const TUESDAY = '2026-10-13';
const WEDNESDAY = '2026-10-14';
const SATURDAY = '2026-10-17';

function streak(overrides: Partial<StreakState>): StreakState {
  return { ...EMPTY_STREAK, ...overrides };
}

describe('recordActivity', () => {
  it('ilk etkinlik seriyi bir günde başlatır', () => {
    const outcome = recordActivity(EMPTY_STREAK, MONDAY);

    expect(outcome.state.currentDays).toBe(1);
    expect(outcome.state.longestDays).toBe(1);
    expect(outcome.state.lastActiveDate).toBe(MONDAY);
    expect(outcome.extended).toBe(true);
  });

  it('aynı gün ikinci kez oynamak seriyi artırmaz', () => {
    const outcome = recordActivity(streak({ currentDays: 4, lastActiveDate: MONDAY }), MONDAY);

    expect(outcome.state.currentDays).toBe(4);
    expect(outcome.extended).toBe(false);
  });

  it('ertesi gün oynamak seriyi bir artırır', () => {
    const outcome = recordActivity(
      streak({ currentDays: 4, longestDays: 9, lastActiveDate: MONDAY }),
      TUESDAY,
    );

    expect(outcome.state.currentDays).toBe(5);
    expect(outcome.state.longestDays).toBe(9);
    expect(outcome.extended).toBe(true);
  });

  it('en uzun seri aşılınca güncellenir', () => {
    const outcome = recordActivity(
      streak({ currentDays: 9, longestDays: 9, lastActiveDate: MONDAY }),
      TUESDAY,
    );

    expect(outcome.state.longestDays).toBe(10);
  });

  it('bir gün kaçırılınca dondurma hakkı seriyi korur', () => {
    const outcome = recordActivity(
      streak({ currentDays: 6, lastActiveDate: MONDAY, freezesLeft: 1 }),
      WEDNESDAY,
    );

    expect(outcome.state.currentDays).toBe(7);
    expect(outcome.state.freezesLeft).toBe(0);
    expect(outcome.usedFreeze).toBe(true);
    expect(outcome.broken).toBe(false);
  });

  it('dondurma hakkı yoksa bir günlük boşluk seriyi kırar', () => {
    const outcome = recordActivity(
      streak({ currentDays: 6, longestDays: 6, lastActiveDate: MONDAY }),
      WEDNESDAY,
    );

    expect(outcome.state.currentDays).toBe(1);
    expect(outcome.state.longestDays).toBe(6);
    expect(outcome.broken).toBe(true);
  });

  it('uzun boşlukta dondurma hakkı olsa da seri kırılır', () => {
    const outcome = recordActivity(
      streak({ currentDays: 20, lastActiveDate: MONDAY, freezesLeft: 3 }),
      SATURDAY,
    );

    expect(outcome.state.currentDays).toBe(1);
    expect(outcome.state.freezesLeft).toBe(3);
    expect(outcome.broken).toBe(true);
  });

  it('eşiklere ulaşınca bildirir', () => {
    const toThree = recordActivity(streak({ currentDays: 2, lastActiveDate: MONDAY }), TUESDAY);
    expect(toThree.milestone).toBe(3);

    const toFour = recordActivity(streak({ currentDays: 3, lastActiveDate: MONDAY }), TUESDAY);
    expect(toFour.milestone).toBeNull();
  });

  it('kırılan seride eşik bildirilmez', () => {
    const outcome = recordActivity(streak({ currentDays: 2, lastActiveDate: MONDAY }), SATURDAY);

    expect(outcome.milestone).toBeNull();
  });
});

describe('isStreakAlive', () => {
  it('bugün veya dün oynanmışsa canlıdır', () => {
    expect(isStreakAlive(streak({ lastActiveDate: TUESDAY }), TUESDAY)).toBe(true);
    expect(isStreakAlive(streak({ lastActiveDate: MONDAY }), TUESDAY)).toBe(true);
    expect(isStreakAlive(streak({ lastActiveDate: MONDAY }), WEDNESDAY)).toBe(false);
    expect(isStreakAlive(EMPTY_STREAK, MONDAY)).toBe(false);
  });
});

describe('toDateKey', () => {
  it('yerel tarihi YYYY-MM-DD olarak verir', () => {
    expect(toDateKey(new Date(2026, 9, 5))).toBe('2026-10-05');
    expect(toDateKey(new Date(2026, 0, 31))).toBe('2026-01-31');
  });

  it('gece yarısına yakın saatlerde günü kaydırmaz', () => {
    expect(toDateKey(new Date(2026, 9, 5, 23, 59))).toBe('2026-10-05');
    expect(toDateKey(new Date(2026, 9, 6, 0, 1))).toBe('2026-10-06');
  });
});
