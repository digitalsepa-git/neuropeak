import type { Segment } from '@neuropeak/core';

/**
 * Varsayılan segmentler.
 *
 * Panel bunları başlangıç listesi olarak gösteriyor; Supabase
 * bağlandığında `segments` tablosuna tohumlanacak ve oradan
 * yönetilecek. Kurallar bilerek az sayıda ve kesin — hangi kitleye
 * bildirim gittiğini okurken anlamak, serbest sorgudan önemli.
 */
export const DEFAULT_SEGMENTS: readonly Segment[] = [
  {
    id: 'all-users',
    title: 'Tüm kullanıcılar',
    description: 'Hiçbir koşul yok. Yalnızca gerçekten herkesi ilgilendiren duyurular için.',
    match: 'all',
    rules: [],
  },
  {
    id: 'newcomers',
    title: 'Yeni başlayanlar',
    description: 'Son bir hafta içinde kaydolmuş, henüz test çözmemiş kullanıcılar.',
    match: 'all',
    rules: [
      { kind: 'registered_within_days', value: 7 },
      { kind: 'tests_at_most', value: 0 },
    ],
  },
  {
    id: 'lapsed-7',
    title: 'Uykuya dalanlar',
    description: 'Yedi gündür uygulamaya girmemiş kullanıcılar.',
    match: 'all',
    rules: [{ kind: 'inactive_days', value: 7 }],
  },
  {
    id: 'lapsed-30',
    title: 'Uzun süredir yok',
    description: 'Bir aydır girmemiş kullanıcılar; geri kazanım kampanyaları için.',
    match: 'all',
    rules: [{ kind: 'inactive_days', value: 30 }],
  },
  {
    id: 'streak-keepers',
    title: 'Seri sahipleri',
    description: 'Yedi gün ve üzeri serisi olanlar. Seriyi hatırlatmak işe yarar.',
    match: 'all',
    rules: [{ kind: 'streak_at_least', value: 7 }],
  },
  {
    id: 'pro-candidates',
    title: 'PRO adayları',
    description: 'PRO olmayan ama düzenli oynayan kullanıcılar.',
    match: 'all',
    rules: [
      { kind: 'is_pro', value: false },
      { kind: 'rounds_at_least', value: 50 },
      { kind: 'tests_at_least', value: 1 },
    ],
  },
  {
    id: 'pro-members',
    title: 'PRO üyeler',
    description: 'Abonelikle ilgili duyurular için.',
    match: 'all',
    rules: [{ kind: 'is_pro', value: true }],
  },
  {
    id: 'high-league',
    title: 'Üst lig oyuncuları',
    description: 'Elmas Lig ve üzeri; lig duyuruları ve turnuvalar için.',
    match: 'all',
    rules: [{ kind: 'league_tier_at_least', tier: 'diamond' }],
  },
];
