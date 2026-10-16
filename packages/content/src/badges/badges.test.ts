import { EMPTY_BRAIN_MAP, isBadgeEarned, type BadgeContext } from '@neuropeak/core';
import { describe, expect, it } from 'vitest';

import { BADGES } from './catalogue';

/**
 * Katalog denetimi. Motorun kendi testleri core'da; burada bakılan
 * şey rozetlerin kendisi — elle yazılan listede en kolay kaçan hatalar
 * tekrar eden kimlik, boş metin ve hiçbir zaman açılmayacak koşul.
 */

const FRESH: BadgeContext = {
  level: 1,
  xp: 0,
  longestStreak: 0,
  totalRounds: 0,
  testsFinished: 0,
  categoryRounds: {},
  brainMap: EMPTY_BRAIN_MAP,
  neuropeak: 50,
  bestLeagueTier: 'bronze',
  bestWeeklyXp: 0,
  bestIq: 0,
};

const MAXED: BadgeContext = {
  level: 999,
  xp: 10_000_000,
  longestStreak: 9999,
  totalRounds: 100_000,
  testsFinished: 500,
  categoryRounds: {
    memory: 10_000,
    attention: 10_000,
    logic: 10_000,
    math: 10_000,
    spatial: 10_000,
    speed: 10_000,
    verbal: 10_000,
  },
  brainMap: { memory: 100, focus: 100, logic: 100, speed: 100, problemSolving: 100 },
  neuropeak: 100,
  bestLeagueTier: 'legend',
  bestWeeklyXp: 1_000_000,
  bestIq: 145,
};

describe('rozet kataloğu', () => {
  it('kimlikler benzersiz', () => {
    const ids = BADGES.map((badge) => badge.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('kimlikler veritabanı biçimine uyar', () => {
    for (const badge of BADGES) {
      expect(badge.id, `${badge.id} geçersiz`).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('kapsamdaki sayıya yakın', () => {
    expect(BADGES.length).toBeGreaterThanOrEqual(40);
  });

  it('metinler iki dilde de dolu', () => {
    for (const badge of BADGES) {
      expect(badge.title.tr.length, `${badge.id} TR başlık`).toBeGreaterThan(0);
      expect(badge.title.en.length, `${badge.id} EN başlık`).toBeGreaterThan(0);
      expect(badge.description.tr.length, `${badge.id} TR açıklama`).toBeGreaterThan(0);
      expect(badge.description.en.length, `${badge.id} EN açıklama`).toBeGreaterThan(0);
    }
  });

  it('kademeler 1–4 arasında', () => {
    for (const badge of BADGES) {
      expect(badge.tier).toBeGreaterThanOrEqual(1);
      expect(badge.tier).toBeLessThanOrEqual(4);
    }
  });

  it('yıldız ödülü kademeyle büyür', () => {
    const averageFor = (tier: number) => {
      const group = BADGES.filter((badge) => badge.tier === tier);
      return group.reduce((total, badge) => total + badge.starReward, 0) / group.length;
    };

    expect(averageFor(4)).toBeGreaterThan(averageFor(2));
    expect(averageFor(2)).toBeGreaterThan(averageFor(1));
  });

  it('hiçbir rozet sıfırdan açık gelmez', () => {
    for (const badge of BADGES) {
      expect(isBadgeEarned(badge, FRESH), `${badge.id} hiç oynamadan kazanılıyor`).toBe(false);
    }
  });

  it('her rozet er geç kazanılabiliyor', () => {
    for (const badge of BADGES) {
      expect(isBadgeEarned(badge, MAXED), `${badge.id} hiçbir koşulda açılmıyor`).toBe(true);
    }
  });

  it('her kademede rozet var', () => {
    for (const tier of [1, 2, 3, 4]) {
      expect(
        BADGES.some((badge) => badge.tier === tier),
        `${tier}. kademe boş`,
      ).toBe(true);
    }
  });

  it('gizli rozetler var ama azınlıkta', () => {
    const secrets = BADGES.filter((badge) => badge.isSecret).length;

    expect(secrets).toBeGreaterThan(0);
    expect(secrets).toBeLessThan(BADGES.length / 4);
  });
});
