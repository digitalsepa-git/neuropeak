import { describe, expect, it } from 'vitest';

import { EMPTY_BRAIN_MAP } from './brain-map';
import {
  badgeProgress,
  badgeTierLabel,
  describeBadgeRequirement,
  isBadgeEarned,
  newlyEarnedBadges,
  showcaseOrder,
  starsForBadges,
  type BadgeContext,
  type BadgeDefinition,
  type BadgeRequirement,
  type BadgeTier,
} from './badges';

const CONTEXT: BadgeContext = {
  level: 7,
  xp: 1500,
  longestStreak: 4,
  totalRounds: 30,
  testsFinished: 1,
  categoryRounds: { logic: 20, memory: 10 },
  brainMap: { ...EMPTY_BRAIN_MAP, logic: 82 },
  neuropeak: 56,
  bestLeagueTier: 'silver',
  bestWeeklyXp: 400,
  bestIq: 118,
};

function badge(
  id: string,
  requirement: BadgeDefinition['requirement'],
  extra = {},
): BadgeDefinition {
  return { id, tier: 1, starReward: 10, isSecret: false, requirement, ...extra };
}

describe('rozet koşulları', () => {
  it('sayısal koşullarda ilerlemeyi hedefle sınırlar', () => {
    expect(badgeProgress({ kind: 'level', value: 5 }, CONTEXT)).toEqual({
      current: 5,
      target: 5,
      done: true,
    });
    expect(badgeProgress({ kind: 'level', value: 15 }, CONTEXT)).toEqual({
      current: 7,
      target: 15,
      done: false,
    });
  });

  it('seride en uzun seriye bakar', () => {
    const dropped: BadgeContext = { ...CONTEXT, longestStreak: 9 };

    // Güncel seri kırılsa bile rozet geri alınmamalı.
    expect(isBadgeEarned(badge('s', { kind: 'streak', value: 7 }), dropped)).toBe(true);
  });

  it('kategori turlarını ayrı sayar', () => {
    expect(
      badgeProgress({ kind: 'category_rounds', category: 'logic', value: 25 }, CONTEXT).current,
    ).toBe(20);
    expect(
      badgeProgress({ kind: 'category_rounds', category: 'speed', value: 25 }, CONTEXT).current,
    ).toBe(0);
  });

  it('kâşif rozeti oynanmış kategori sayısına bakar', () => {
    const progress = badgeProgress({ kind: 'all_categories' }, CONTEXT);

    expect(progress.current).toBe(2);
    expect(progress.target).toBe(7);
    expect(progress.done).toBe(false);
  });

  it('bütün kategoriler oynanınca kâşif açılır', () => {
    const everywhere: BadgeContext = {
      ...CONTEXT,
      categoryRounds: {
        memory: 1,
        attention: 1,
        logic: 1,
        math: 1,
        spatial: 1,
        speed: 1,
        verbal: 1,
      },
    };

    expect(isBadgeEarned(badge('x', { kind: 'all_categories' }), everywhere)).toBe(true);
  });

  it('eksen puanı koşulu beyin haritasını okur', () => {
    expect(
      isBadgeEarned(badge('a', { kind: 'axis_score', axis: 'logic', value: 80 }), CONTEXT),
    ).toBe(true);
    expect(
      isBadgeEarned(badge('b', { kind: 'axis_score', axis: 'speed', value: 80 }), CONTEXT),
    ).toBe(false);
  });

  it('lig koşulu kademe sırasına bakar', () => {
    expect(isBadgeEarned(badge('l', { kind: 'league_tier', tier: 'silver' }), CONTEXT)).toBe(true);
    expect(isBadgeEarned(badge('g', { kind: 'league_tier', tier: 'gold' }), CONTEXT)).toBe(false);
  });

  it('haftalık XP koşulu en iyi haftaya bakar', () => {
    expect(isBadgeEarned(badge('w', { kind: 'weekly_xp', value: 300 }), CONTEXT)).toBe(true);
    expect(isBadgeEarned(badge('w2', { kind: 'weekly_xp', value: 1000 }), CONTEXT)).toBe(false);
  });

  it('IQ koşulu en yüksek sonuca bakar', () => {
    expect(isBadgeEarned(badge('i', { kind: 'best_iq', value: 115 }), CONTEXT)).toBe(true);
    expect(isBadgeEarned(badge('i2', { kind: 'best_iq', value: 130 }), CONTEXT)).toBe(false);
  });

  it('hiç veri yokken hiçbir sayısal rozet açılmaz', () => {
    const fresh: BadgeContext = {
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

    expect(isBadgeEarned(badge('r', { kind: 'rounds', value: 10 }), fresh)).toBe(false);
    expect(isBadgeEarned(badge('t', { kind: 'tests', value: 1 }), fresh)).toBe(false);
    expect(isBadgeEarned(badge('x', { kind: 'all_categories' }), fresh)).toBe(false);
  });
});

describe('rozet kazanımı', () => {
  const definitions = [
    badge('a', { kind: 'level', value: 5 }),
    badge('b', { kind: 'level', value: 50 }),
    badge('c', { kind: 'rounds', value: 10 }),
  ];

  it('yalnızca yeni kazanılanları döndürür', () => {
    const earned = newlyEarnedBadges(definitions, CONTEXT, ['a']);
    expect(earned.map((item) => item.id)).toEqual(['c']);
  });

  it('hepsi kazanılmışsa boş döner', () => {
    expect(newlyEarnedBadges(definitions, CONTEXT, ['a', 'b', 'c'])).toEqual([]);
  });

  it('yıldız ödüllerini toplar', () => {
    expect(starsForBadges([badge('a', { kind: 'level', value: 1 }, { starReward: 15 })])).toBe(15);
    expect(starsForBadges([])).toBe(0);
  });
});

describe('vitrin sırası', () => {
  const definitions = [
    badge('far', { kind: 'rounds', value: 2000 }),
    badge('close', { kind: 'rounds', value: 40 }),
    badge('earned', { kind: 'level', value: 5 }),
    badge('secret', { kind: 'rounds', value: 1 }, { isSecret: true }),
  ];

  it('kazanılanlar önde, sonra tamamlanmaya yakın olanlar', () => {
    const order = showcaseOrder(definitions, CONTEXT, ['earned']);
    expect(order.map((item) => item.id)).toEqual(['earned', 'close', 'far']);
  });

  it('kazanılmamış gizli rozet listede yok', () => {
    expect(showcaseOrder(definitions, CONTEXT, []).map((item) => item.id)).not.toContain('secret');
  });

  it('kazanılmış gizli rozet listeye girer', () => {
    expect(showcaseOrder(definitions, CONTEXT, ['secret']).map((item) => item.id)).toContain(
      'secret',
    );
  });
});

describe('describeBadgeRequirement', () => {
  const KINDS: readonly BadgeRequirement[] = [
    { kind: 'level', value: 5 },
    { kind: 'xp', value: 1000 },
    { kind: 'streak', value: 7 },
    { kind: 'rounds', value: 50 },
    { kind: 'tests', value: 3 },
    { kind: 'category_rounds', category: 'memory', value: 20 },
    { kind: 'all_categories' },
    { kind: 'axis_score', axis: 'logic', value: 80 },
    { kind: 'neuropeak', value: 75 },
    { kind: 'league_tier', tier: 'gold' },
    { kind: 'weekly_xp', value: 500 },
    { kind: 'best_iq', value: 130 },
  ];

  it('her koşul türü için bir cümle üretir', () => {
    for (const requirement of KINDS) {
      const text = describeBadgeRequirement(requirement);
      expect(text.length, requirement.kind).toBeGreaterThan(0);
      // Etiket tablosundan düşen bir anahtar "undefined" yazardı.
      expect(text, requirement.kind).not.toContain('undefined');
    }
  });

  it('sayıya gelen ek okunuşa uyuyor', () => {
    expect(describeBadgeRequirement({ kind: 'level', value: 5 })).toBe("Seviye 5'e ulaş");
    expect(describeBadgeRequirement({ kind: 'level', value: 30 })).toBe("Seviye 30'a ulaş");
  });
});

describe('badgeTierLabel', () => {
  it('dört kademeyi de adlandırır', () => {
    expect([1, 2, 3, 4].map((tier) => badgeTierLabel(tier as BadgeTier))).toEqual([
      'Bronz',
      'Gümüş',
      'Altın',
      'Platin',
    ]);
  });
});
