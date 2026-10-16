import { LEAGUE_TIERS, type LeagueTier } from '../gamification/league';

/**
 * Kullanıcı segmentleri.
 *
 * Rozetlerdeki yaklaşımın aynısı: kimin segmente girdiği kuralla
 * anlatılıyor, kodla değil. Kural bir veri yapısı olduğu için hem
 * panelde insan diliyle yazdırılabiliyor hem de ileride sunucuda
 * SQL'e çevrilebilecek. Şimdilik tek çalıştığı yer burası.
 *
 * Kurallar bilerek az sayıda ve kesin: "son 7 gündür girmeyenler"
 * gibi anlaşılır bir şey, serbest sorgu dilinden daha kullanışlı ve
 * yanlış kitleye bildirim gönderme riski daha düşük.
 */

export type SegmentRule =
  | { readonly kind: 'is_pro'; readonly value: boolean }
  | { readonly kind: 'level_at_least'; readonly value: number }
  | { readonly kind: 'neuropeak_at_least'; readonly value: number }
  | { readonly kind: 'streak_at_least'; readonly value: number }
  /** Son girişin üstünden en az bu kadar gün geçmiş. */
  | { readonly kind: 'inactive_days'; readonly value: number }
  | { readonly kind: 'tests_at_least'; readonly value: number }
  /** En fazla bu kadar test çözmüş; "henüz başlamamış" kitlesi için. */
  | { readonly kind: 'tests_at_most'; readonly value: number }
  | { readonly kind: 'rounds_at_least'; readonly value: number }
  | { readonly kind: 'locale'; readonly value: 'tr' | 'en' }
  | { readonly kind: 'league_tier_at_least'; readonly tier: LeagueTier }
  /** Kaydolalı en fazla bu kadar gün olmuş. */
  | { readonly kind: 'registered_within_days'; readonly value: number };

export type Segment = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /** Kuralların hepsi mi sağlanmalı, biri mi yeter. */
  readonly match: 'all' | 'any';
  readonly rules: readonly SegmentRule[];
};

/** Segment değerlendirilirken bakılan kullanıcı özeti. */
export type UserSnapshot = {
  readonly isPro: boolean;
  readonly level: number;
  readonly neuropeak: number;
  readonly streakDays: number;
  readonly daysSinceLastActive: number;
  readonly testsFinished: number;
  readonly totalRounds: number;
  readonly locale: 'tr' | 'en';
  readonly leagueTier: LeagueTier;
  readonly daysSinceRegistered: number;
};

export function matchesRule(rule: SegmentRule, user: UserSnapshot): boolean {
  switch (rule.kind) {
    case 'is_pro':
      return user.isPro === rule.value;
    case 'level_at_least':
      return user.level >= rule.value;
    case 'neuropeak_at_least':
      return user.neuropeak >= rule.value;
    case 'streak_at_least':
      return user.streakDays >= rule.value;
    case 'inactive_days':
      return user.daysSinceLastActive >= rule.value;
    case 'tests_at_least':
      return user.testsFinished >= rule.value;
    case 'tests_at_most':
      return user.testsFinished <= rule.value;
    case 'rounds_at_least':
      return user.totalRounds >= rule.value;
    case 'locale':
      return user.locale === rule.value;
    case 'league_tier_at_least':
      return LEAGUE_TIERS.indexOf(user.leagueTier) >= LEAGUE_TIERS.indexOf(rule.tier);
    case 'registered_within_days':
      return user.daysSinceRegistered <= rule.value;
  }
}

export function matchesSegment(segment: Segment, user: UserSnapshot): boolean {
  // Kuralsız segment herkesi kapsar; "tüm kullanıcılar" bunun adı.
  if (segment.rules.length === 0) return true;

  return segment.match === 'all'
    ? segment.rules.every((rule) => matchesRule(rule, user))
    : segment.rules.some((rule) => matchesRule(rule, user));
}

export function audienceFor(segment: Segment, users: readonly UserSnapshot[]): UserSnapshot[] {
  return users.filter((user) => matchesSegment(segment, user));
}

const TIER_LABELS: Readonly<Record<LeagueTier, string>> = {
  bronze: 'Bronz',
  silver: 'Gümüş',
  gold: 'Altın',
  platinum: 'Platin',
  diamond: 'Elmas',
  legend: 'Efsane',
};

/** Kuralı panelde gösterilecek Türkçe cümleye çevirir. */
export function describeRule(rule: SegmentRule): string {
  switch (rule.kind) {
    case 'is_pro':
      return rule.value ? 'PRO üye' : 'PRO üye değil';
    case 'level_at_least':
      return `Seviye ${rule.value} ve üzeri`;
    case 'neuropeak_at_least':
      return `NeuroPeak skoru ${rule.value} ve üzeri`;
    case 'streak_at_least':
      return `Serisi ${rule.value} gün ve üzeri`;
    case 'inactive_days':
      return `${rule.value} gündür girmemiş`;
    case 'tests_at_least':
      return `En az ${rule.value} test tamamlamış`;
    case 'tests_at_most':
      return rule.value === 0 ? 'Hiç test çözmemiş' : `En fazla ${rule.value} test çözmüş`;
    case 'rounds_at_least':
      return `En az ${rule.value} tur oynamış`;
    case 'locale':
      return rule.value === 'tr' ? 'Dili Türkçe' : 'Dili İngilizce';
    case 'league_tier_at_least':
      return `${TIER_LABELS[rule.tier]} Lig ve üzeri`;
    case 'registered_within_days':
      return `Son ${rule.value} gün içinde kaydolmuş`;
  }
}

export function describeSegment(segment: Segment): string {
  if (segment.rules.length === 0) return 'Tüm kullanıcılar';

  const joiner = segment.match === 'all' ? ' ve ' : ' ya da ';
  return segment.rules.map(describeRule).join(joiner);
}
