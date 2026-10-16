import { describe, expect, it } from 'vitest';

import {
  PUSH_BODY_MAX,
  PUSH_TITLE_MAX,
  isCampaignReady,
  previewText,
  validateCampaign,
  type PushCampaign,
} from './push';
import {
  audienceFor,
  describeRule,
  describeSegment,
  matchesRule,
  matchesSegment,
  type Segment,
  type UserSnapshot,
} from './segments';

const ACTIVE: UserSnapshot = {
  isPro: false,
  level: 12,
  neuropeak: 64,
  streakDays: 9,
  daysSinceLastActive: 0,
  testsFinished: 3,
  totalRounds: 140,
  locale: 'tr',
  leagueTier: 'gold',
  daysSinceRegistered: 40,
};

const LAPSED: UserSnapshot = {
  ...ACTIVE,
  streakDays: 0,
  daysSinceLastActive: 12,
  leagueTier: 'bronze',
};

const NEWCOMER: UserSnapshot = {
  isPro: false,
  level: 2,
  neuropeak: 50,
  streakDays: 1,
  daysSinceLastActive: 0,
  testsFinished: 0,
  totalRounds: 4,
  locale: 'en',
  leagueTier: 'bronze',
  daysSinceRegistered: 2,
};

function segment(rules: Segment['rules'], match: Segment['match'] = 'all'): Segment {
  return { id: 's', title: 'S', description: '', match, rules };
}

describe('segment kuralları', () => {
  it('PRO durumunu iki yönde de okur', () => {
    expect(matchesRule({ kind: 'is_pro', value: false }, ACTIVE)).toBe(true);
    expect(matchesRule({ kind: 'is_pro', value: true }, ACTIVE)).toBe(false);
  });

  it('eşik kuralları "ve üzeri" anlamında', () => {
    expect(matchesRule({ kind: 'level_at_least', value: 12 }, ACTIVE)).toBe(true);
    expect(matchesRule({ kind: 'level_at_least', value: 13 }, ACTIVE)).toBe(false);
  });

  it('hareketsizlik gün sayısını eşik olarak alır', () => {
    expect(matchesRule({ kind: 'inactive_days', value: 7 }, LAPSED)).toBe(true);
    expect(matchesRule({ kind: 'inactive_days', value: 7 }, ACTIVE)).toBe(false);
  });

  it('"en fazla" kuralı başlamamış kullanıcıyı yakalar', () => {
    expect(matchesRule({ kind: 'tests_at_most', value: 0 }, NEWCOMER)).toBe(true);
    expect(matchesRule({ kind: 'tests_at_most', value: 0 }, ACTIVE)).toBe(false);
  });

  it('kayıt tarihi kuralı tersine çalışır: en fazla o kadar gün', () => {
    expect(matchesRule({ kind: 'registered_within_days', value: 7 }, NEWCOMER)).toBe(true);
    expect(matchesRule({ kind: 'registered_within_days', value: 7 }, ACTIVE)).toBe(false);
  });

  it('lig kuralı kademe sırasına bakar', () => {
    expect(matchesRule({ kind: 'league_tier_at_least', tier: 'gold' }, ACTIVE)).toBe(true);
    expect(matchesRule({ kind: 'league_tier_at_least', tier: 'platinum' }, ACTIVE)).toBe(false);
    expect(matchesRule({ kind: 'league_tier_at_least', tier: 'bronze' }, LAPSED)).toBe(true);
  });

  it('dil kuralı tam eşleşir', () => {
    expect(matchesRule({ kind: 'locale', value: 'tr' }, ACTIVE)).toBe(true);
    expect(matchesRule({ kind: 'locale', value: 'tr' }, NEWCOMER)).toBe(false);
  });
});

describe('segment eşleşmesi', () => {
  it('"all" bütün kuralları ister', () => {
    const target = segment([
      { kind: 'is_pro', value: false },
      { kind: 'level_at_least', value: 10 },
    ]);

    expect(matchesSegment(target, ACTIVE)).toBe(true);
    expect(matchesSegment(target, NEWCOMER)).toBe(false);
  });

  it('"any" bir kural yeter', () => {
    const target = segment(
      [
        { kind: 'level_at_least', value: 50 },
        { kind: 'locale', value: 'en' },
      ],
      'any',
    );

    expect(matchesSegment(target, NEWCOMER)).toBe(true);
    expect(matchesSegment(target, ACTIVE)).toBe(false);
  });

  it('kuralsız segment herkesi kapsar', () => {
    expect(matchesSegment(segment([]), ACTIVE)).toBe(true);
    expect(matchesSegment(segment([]), NEWCOMER)).toBe(true);
  });

  it('kitleyi süzer', () => {
    const lapsedSegment = segment([{ kind: 'inactive_days', value: 7 }]);
    const audience = audienceFor(lapsedSegment, [ACTIVE, LAPSED, NEWCOMER]);

    expect(audience).toHaveLength(1);
    expect(audience[0]).toBe(LAPSED);
  });

  it('her kural için Türkçe karşılık var', () => {
    const rules: Segment['rules'] = [
      { kind: 'is_pro', value: true },
      { kind: 'level_at_least', value: 5 },
      { kind: 'neuropeak_at_least', value: 70 },
      { kind: 'streak_at_least', value: 3 },
      { kind: 'inactive_days', value: 7 },
      { kind: 'tests_at_least', value: 1 },
      { kind: 'tests_at_most', value: 0 },
      { kind: 'rounds_at_least', value: 50 },
      { kind: 'locale', value: 'tr' },
      { kind: 'league_tier_at_least', tier: 'gold' },
      { kind: 'registered_within_days', value: 3 },
    ];

    for (const rule of rules) {
      expect(describeRule(rule).length, rule.kind).toBeGreaterThan(3);
    }
  });

  it('segment açıklaması kuralları birleştirir', () => {
    expect(
      describeSegment(
        segment([
          { kind: 'is_pro', value: false },
          { kind: 'inactive_days', value: 7 },
        ]),
      ),
    ).toBe('PRO üye değil ve 7 gündür girmemiş');

    expect(describeSegment(segment([]))).toBe('Tüm kullanıcılar');
  });
});

describe('push kampanyası', () => {
  const valid: PushCampaign = {
    id: 'c1',
    segmentId: 's1',
    tr: { title: 'Serini koru', body: 'Bugün bir tur oyna, serin devam etsin.' },
    en: { title: 'Keep your streak', body: 'Play one round today to keep it going.' },
  };

  it('geçerli kampanyada sorun yok', () => {
    expect(validateCampaign(valid)).toEqual([]);
    expect(isCampaignReady(valid)).toBe(true);
  });

  it('boş metni yakalar', () => {
    const issues = validateCampaign({ ...valid, tr: { title: '  ', body: '' } });

    expect(issues).toHaveLength(2);
    expect(issues.every((issue) => issue.locale === 'tr')).toBe(true);
  });

  it('eksik çeviriyi yakalar', () => {
    const issues = validateCampaign({ ...valid, en: { title: '', body: '' } });
    expect(issues.some((issue) => issue.locale === 'en')).toBe(true);
  });

  it('uzun başlığı ve metni yakalar', () => {
    const issues = validateCampaign({
      ...valid,
      tr: { title: 'a'.repeat(PUSH_TITLE_MAX + 1), body: 'b'.repeat(PUSH_BODY_MAX + 1) },
    });

    expect(issues).toHaveLength(2);
  });

  it('sınırdaki uzunluk geçerli', () => {
    const issues = validateCampaign({
      ...valid,
      tr: { title: 'a'.repeat(PUSH_TITLE_MAX), body: 'b'.repeat(PUSH_BODY_MAX) },
    });

    expect(issues).toEqual([]);
  });

  it('geçersiz gönderim saatini yakalar', () => {
    expect(validateCampaign({ ...valid, localHour: 24 })).toHaveLength(1);
    expect(validateCampaign({ ...valid, localHour: -1 })).toHaveLength(1);
    expect(validateCampaign({ ...valid, localHour: 9 })).toEqual([]);
  });

  it('önizleme uzun metni kısaltır', () => {
    expect(previewText('kısa', 10)).toBe('kısa');
    expect(previewText('a'.repeat(20), 10)).toBe(`${'a'.repeat(9)}…`);
  });
});
