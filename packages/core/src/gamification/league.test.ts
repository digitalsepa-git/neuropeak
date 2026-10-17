import { describe, expect, it } from 'vitest';

import {
  GROUP_SIZE,
  LEAGUE_TIERS,
  PROMOTION_COUNT,
  RELEGATION_COUNT,
  remainingTime,
  generatePracticeCohort,
  msUntilWeekEnd,
  outcomeForRank,
  standings,
  tierAfter,
  weekProgress,
  weekStartKey,
  xpToPromotion,
  type LeagueMember,
} from './league';

const NAMES = Array.from({ length: 35 }, (_, index) => `Oyuncu ${index}`);

function cohort(userXp: number, progress = 1): LeagueMember[] {
  return generatePracticeCohort({
    names: NAMES,
    tier: 'gold',
    weekStart: '2026-10-12',
    userId: 'me',
    userName: 'Sen',
    userXp,
    progress,
  });
}

describe('hafta sınırları', () => {
  it('haftanın pazartesisini verir', () => {
    // 2026-10-16 cuma; o haftanın pazartesisi 12 Ekim.
    expect(weekStartKey(new Date(2026, 9, 16))).toBe('2026-10-12');
    expect(weekStartKey(new Date(2026, 9, 12))).toBe('2026-10-12');
  });

  it('pazar günü hâlâ aynı haftaya aittir', () => {
    expect(weekStartKey(new Date(2026, 9, 18))).toBe('2026-10-12');
  });

  it('pazartesi yeni hafta başlatır', () => {
    expect(weekStartKey(new Date(2026, 9, 19))).toBe('2026-10-19');
  });

  it('ay ve yıl sınırını geçer', () => {
    expect(weekStartKey(new Date(2027, 0, 1))).toBe('2026-12-28');
  });

  it('hafta ilerlemesi 0 ile 1 arasında', () => {
    expect(weekProgress(new Date(2026, 9, 12, 0, 0))).toBeCloseTo(0, 3);
    expect(weekProgress(new Date(2026, 9, 15, 12, 0))).toBeGreaterThan(0.4);
    expect(weekProgress(new Date(2026, 9, 18, 23, 59))).toBeLessThanOrEqual(1);
  });

  it('kalan süre hafta sonuna doğru azalır', () => {
    const early = msUntilWeekEnd(new Date(2026, 9, 12, 10, 0));
    const late = msUntilWeekEnd(new Date(2026, 9, 17, 10, 0));

    expect(early).toBeGreaterThan(late);
    expect(late).toBeGreaterThan(0);
  });

  it('kalan süreyi okunur yazar', () => {
    expect(remainingTime(3 * 86_400_000 + 14 * 3_600_000)).toEqual({
      unit: 'days',
      days: 3,
      hours: 14,
    });
    expect(remainingTime(14 * 3_600_000 + 20 * 60_000)).toEqual({
      unit: 'hours',
      hours: 14,
      minutes: 20,
    });
    expect(remainingTime(12 * 60_000)).toEqual({ unit: 'minutes', minutes: 12 });
    // Hafta bitmişse geriye sayı taşmasın.
    expect(remainingTime(-5_000)).toEqual({ unit: 'minutes', minutes: 0 });
  });
});

describe('sıralama ve terfi', () => {
  it("XP'ye göre azalan sıralar", () => {
    const table = standings([
      { id: 'a', name: 'A', weeklyXp: 100 },
      { id: 'b', name: 'B', weeklyXp: 300 },
      { id: 'c', name: 'C', weeklyXp: 200 },
    ]);

    expect(table.map((row) => row.id)).toEqual(['b', 'c', 'a']);
    expect(table.map((row) => row.rank)).toEqual([1, 2, 3]);
  });

  it('eşitlikte sıralama kararlı', () => {
    const members = [
      { id: 'z', name: 'Z', weeklyXp: 100 },
      { id: 'a', name: 'A', weeklyXp: 100 },
    ];

    expect(standings(members).map((row) => row.id)).toEqual(['a', 'z']);
    expect(standings([...members].reverse()).map((row) => row.id)).toEqual(['a', 'z']);
  });

  it('ilk on terfi, son beş düşer', () => {
    expect(outcomeForRank(1, GROUP_SIZE)).toBe('promote');
    expect(outcomeForRank(PROMOTION_COUNT, GROUP_SIZE)).toBe('promote');
    expect(outcomeForRank(PROMOTION_COUNT + 1, GROUP_SIZE)).toBe('hold');
    expect(outcomeForRank(GROUP_SIZE - RELEGATION_COUNT, GROUP_SIZE)).toBe('hold');
    expect(outcomeForRank(GROUP_SIZE - RELEGATION_COUNT + 1, GROUP_SIZE)).toBe('relegate');
    expect(outcomeForRank(GROUP_SIZE, GROUP_SIZE)).toBe('relegate');
  });

  it('terfi bir üst kademeye taşır', () => {
    expect(tierAfter('bronze', 'promote')).toBe('silver');
    expect(tierAfter('gold', 'relegate')).toBe('silver');
    expect(tierAfter('gold', 'hold')).toBe('gold');
  });

  it('kademeler uçlarda takılır', () => {
    expect(tierAfter('legend', 'promote')).toBe('legend');
    expect(tierAfter('bronze', 'relegate')).toBe('bronze');
  });

  it('terfi için gereken XP sınırdakini geçmeye yeter', () => {
    const table = standings(cohort(0));
    const needed = xpToPromotion(table, 'me');

    expect(needed).toBeGreaterThan(0);

    const after = standings(cohort(needed));
    expect(after.find((row) => row.id === 'me')?.rank).toBeLessThanOrEqual(PROMOTION_COUNT);
  });

  it('zaten terfi bölgesindeyse sıfır', () => {
    const table = standings(cohort(999_999));
    expect(xpToPromotion(table, 'me')).toBe(0);
  });
});

describe('deneme grubu', () => {
  it('grup tam boyutta ve kullanıcıyı içerir', () => {
    const members = cohort(500);

    expect(members).toHaveLength(GROUP_SIZE);
    expect(members.filter((member) => member.isCurrentUser === true)).toHaveLength(1);
  });

  it('kimlikler benzersiz', () => {
    const ids = cohort(500).map((member) => member.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('adlar tekrar etmez', () => {
    const names = cohort(500)
      .filter((member) => member.isCurrentUser !== true)
      .map((member) => member.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('aynı hafta ve kullanıcı için grup değişmez', () => {
    expect(cohort(500)).toEqual(cohort(500));
  });

  it('hafta ilerledikçe rakiplerin XP’si artar', () => {
    const early = cohort(0, 0.2).filter((member) => member.isCurrentUser !== true);
    const late = cohort(0, 1).filter((member) => member.isCurrentUser !== true);

    const sum = (list: readonly LeagueMember[]) =>
      list.reduce((total, member) => total + member.weeklyXp, 0);

    expect(sum(late)).toBeGreaterThan(sum(early));
  });

  it('üst kademede rakipler daha çok oynar', () => {
    const sum = (tier: 'bronze' | 'legend') =>
      generatePracticeCohort({
        names: NAMES,
        tier,
        weekStart: '2026-10-12',
        userId: 'me',
        userName: 'Sen',
        userXp: 0,
        progress: 1,
      }).reduce((total, member) => total + member.weeklyXp, 0);

    expect(sum('legend')).toBeGreaterThan(sum('bronze'));
  });

  it('her kademede grup üretilebiliyor', () => {
    for (const tier of LEAGUE_TIERS) {
      const members = generatePracticeCohort({
        names: NAMES,
        tier,
        weekStart: '2026-10-12',
        userId: 'me',
        userName: 'Sen',
        userXp: 100,
        progress: 0.5,
      });

      expect(members).toHaveLength(GROUP_SIZE);
      expect(members.every((member) => member.weeklyXp >= 0)).toBe(true);
    }
  });
});
