import type { BadgeDefinition } from '@neuropeak/core';

import type { Localized } from '../types';

/**
 * Rozet kataloğu.
 *
 * Koşullar `@neuropeak/core`'daki motorun anladığı veri; buradaki tek
 * iş hangi rozetin ne istediğini ve ne yazdığını söylemek. Kademeler:
 * 1 Bronz, 2 Gümüş, 3 Altın, 4 Platin. Yıldız ödülü kademeyle artıyor.
 *
 * Gizli rozetler listede görünmüyor; kazanılınca ortaya çıkıyor.
 * Sürpriz olmaları için koşulları da alışılmadık.
 */

export type ContentBadge = BadgeDefinition & {
  readonly title: Localized;
  readonly description: Localized;
};

export const BADGES: readonly ContentBadge[] = [
  // ------------------------------------------------------ ilerleme (seviye)
  {
    id: 'level-5',
    tier: 1,
    starReward: 15,
    isSecret: false,
    requirement: { kind: 'level', value: 5 },
    title: { tr: 'İlk Adımlar', en: 'First Steps' },
    description: { tr: '5. seviyeye ulaş', en: 'Reach level 5' },
  },
  {
    id: 'level-15',
    tier: 2,
    starReward: 30,
    isSecret: false,
    requirement: { kind: 'level', value: 15 },
    title: { tr: 'Yol Alıyor', en: 'Gaining Ground' },
    description: { tr: '15. seviyeye ulaş', en: 'Reach level 15' },
  },
  {
    id: 'level-40',
    tier: 3,
    starReward: 60,
    isSecret: false,
    requirement: { kind: 'level', value: 40 },
    title: { tr: 'Deneyimli', en: 'Seasoned' },
    description: { tr: '40. seviyeye ulaş', en: 'Reach level 40' },
  },
  {
    id: 'level-100',
    tier: 4,
    starReward: 150,
    isSecret: false,
    requirement: { kind: 'level', value: 100 },
    title: { tr: 'Yüz Seviye', en: 'Century' },
    description: { tr: '100. seviyeye ulaş', en: 'Reach level 100' },
  },

  // ---------------------------------------------------------- ilerleme (XP)
  {
    id: 'xp-1000',
    tier: 1,
    starReward: 15,
    isSecret: false,
    requirement: { kind: 'xp', value: 1000 },
    title: { tr: 'Bin XP', en: 'A Thousand XP' },
    description: { tr: 'Toplam 1.000 XP kazan', en: 'Earn 1,000 XP in total' },
  },
  {
    id: 'xp-10000',
    tier: 2,
    starReward: 35,
    isSecret: false,
    requirement: { kind: 'xp', value: 10_000 },
    title: { tr: 'On Bin XP', en: 'Ten Thousand XP' },
    description: { tr: 'Toplam 10.000 XP kazan', en: 'Earn 10,000 XP in total' },
  },
  {
    id: 'xp-50000',
    tier: 3,
    starReward: 70,
    isSecret: false,
    requirement: { kind: 'xp', value: 50_000 },
    title: { tr: 'Elli Bin XP', en: 'Fifty Thousand XP' },
    description: { tr: 'Toplam 50.000 XP kazan', en: 'Earn 50,000 XP in total' },
  },

  // ----------------------------------------------------------------- seri
  {
    id: 'streak-3',
    tier: 1,
    starReward: 15,
    isSecret: false,
    requirement: { kind: 'streak', value: 3 },
    title: { tr: 'Üç Gün', en: 'Three Days' },
    description: { tr: '3 gün üst üste oyna', en: 'Play 3 days in a row' },
  },
  {
    id: 'streak-7',
    tier: 2,
    starReward: 30,
    isSecret: false,
    requirement: { kind: 'streak', value: 7 },
    title: { tr: 'Bir Hafta', en: 'One Week' },
    description: { tr: '7 gün üst üste oyna', en: 'Play 7 days in a row' },
  },
  {
    id: 'streak-30',
    tier: 3,
    starReward: 80,
    isSecret: false,
    requirement: { kind: 'streak', value: 30 },
    title: { tr: 'Bir Ay', en: 'One Month' },
    description: { tr: '30 gün üst üste oyna', en: 'Play 30 days in a row' },
  },
  {
    id: 'streak-100',
    tier: 4,
    starReward: 200,
    isSecret: false,
    requirement: { kind: 'streak', value: 100 },
    title: { tr: 'Yüz Gün', en: 'Hundred Days' },
    description: { tr: '100 gün üst üste oyna', en: 'Play 100 days in a row' },
  },

  // ------------------------------------------------------------- oyun turu
  {
    id: 'rounds-10',
    tier: 1,
    starReward: 10,
    isSecret: false,
    requirement: { kind: 'rounds', value: 10 },
    title: { tr: 'Isınma', en: 'Warm-up' },
    description: { tr: '10 oyun turu tamamla', en: 'Play 10 game rounds' },
  },
  {
    id: 'rounds-100',
    tier: 2,
    starReward: 30,
    isSecret: false,
    requirement: { kind: 'rounds', value: 100 },
    title: { tr: 'Yüz Tur', en: 'Hundred Rounds' },
    description: { tr: '100 oyun turu tamamla', en: 'Play 100 game rounds' },
  },
  {
    id: 'rounds-500',
    tier: 3,
    starReward: 70,
    isSecret: false,
    requirement: { kind: 'rounds', value: 500 },
    title: { tr: 'Beş Yüz Tur', en: 'Five Hundred Rounds' },
    description: { tr: '500 oyun turu tamamla', en: 'Play 500 game rounds' },
  },
  {
    id: 'rounds-2000',
    tier: 4,
    starReward: 180,
    isSecret: false,
    requirement: { kind: 'rounds', value: 2000 },
    title: { tr: 'Maraton', en: 'Marathon' },
    description: { tr: '2.000 oyun turu tamamla', en: 'Play 2,000 game rounds' },
  },

  // --------------------------------------------------------------- keşif
  {
    id: 'explorer',
    tier: 2,
    starReward: 40,
    isSecret: false,
    requirement: { kind: 'all_categories' },
    title: { tr: 'Kâşif', en: 'Explorer' },
    description: { tr: 'Her kategoriden bir oyun oyna', en: 'Play a game in every category' },
  },

  // ------------------------------------------------- kategori ustalıkları
  {
    id: 'memory-25',
    tier: 2,
    starReward: 25,
    isSecret: false,
    requirement: { kind: 'category_rounds', category: 'memory', value: 25 },
    title: { tr: 'Hafıza Çalışkanı', en: 'Memory Regular' },
    description: { tr: '25 hafıza turu oyna', en: 'Play 25 memory rounds' },
  },
  {
    id: 'attention-25',
    tier: 2,
    starReward: 25,
    isSecret: false,
    requirement: { kind: 'category_rounds', category: 'attention', value: 25 },
    title: { tr: 'Odak Çalışkanı', en: 'Focus Regular' },
    description: { tr: '25 odaklanma turu oyna', en: 'Play 25 attention rounds' },
  },
  {
    id: 'logic-25',
    tier: 2,
    starReward: 25,
    isSecret: false,
    requirement: { kind: 'category_rounds', category: 'logic', value: 25 },
    title: { tr: 'Mantık Çalışkanı', en: 'Logic Regular' },
    description: { tr: '25 mantık turu oyna', en: 'Play 25 logic rounds' },
  },
  {
    id: 'math-25',
    tier: 2,
    starReward: 25,
    isSecret: false,
    requirement: { kind: 'category_rounds', category: 'math', value: 25 },
    title: { tr: 'Sayı Çalışkanı', en: 'Numbers Regular' },
    description: { tr: '25 matematik turu oyna', en: 'Play 25 math rounds' },
  },
  {
    id: 'spatial-25',
    tier: 2,
    starReward: 25,
    isSecret: false,
    requirement: { kind: 'category_rounds', category: 'spatial', value: 25 },
    title: { tr: 'Uzam Çalışkanı', en: 'Spatial Regular' },
    description: { tr: '25 görsel-uzamsal tur oyna', en: 'Play 25 spatial rounds' },
  },
  {
    id: 'speed-25',
    tier: 2,
    starReward: 25,
    isSecret: false,
    requirement: { kind: 'category_rounds', category: 'speed', value: 25 },
    title: { tr: 'Hız Çalışkanı', en: 'Speed Regular' },
    description: { tr: '25 hız turu oyna', en: 'Play 25 speed rounds' },
  },
  {
    id: 'verbal-25',
    tier: 2,
    starReward: 25,
    isSecret: false,
    requirement: { kind: 'category_rounds', category: 'verbal', value: 25 },
    title: { tr: 'Kelime Çalışkanı', en: 'Word Regular' },
    description: { tr: '25 sözel tur oyna', en: 'Play 25 verbal rounds' },
  },
  {
    id: 'logic-200',
    tier: 4,
    starReward: 120,
    isSecret: false,
    requirement: { kind: 'category_rounds', category: 'logic', value: 200 },
    title: { tr: 'Mantık Ustası', en: 'Logic Master' },
    description: { tr: '200 mantık turu oyna', en: 'Play 200 logic rounds' },
  },
  {
    id: 'memory-200',
    tier: 4,
    starReward: 120,
    isSecret: false,
    requirement: { kind: 'category_rounds', category: 'memory', value: 200 },
    title: { tr: 'Hafıza Ustası', en: 'Memory Master' },
    description: { tr: '200 hafıza turu oyna', en: 'Play 200 memory rounds' },
  },

  // ------------------------------------------------------- beyin haritası
  {
    id: 'axis-memory-80',
    tier: 3,
    starReward: 60,
    isSecret: false,
    requirement: { kind: 'axis_score', axis: 'memory', value: 80 },
    title: { tr: 'Keskin Hafıza', en: 'Sharp Memory' },
    description: { tr: 'Hafıza ekseninde 80 puana ulaş', en: 'Reach 80 on the memory axis' },
  },
  {
    id: 'axis-focus-80',
    tier: 3,
    starReward: 60,
    isSecret: false,
    requirement: { kind: 'axis_score', axis: 'focus', value: 80 },
    title: { tr: 'Dağılmayan Odak', en: 'Unbroken Focus' },
    description: { tr: 'Odaklanma ekseninde 80 puana ulaş', en: 'Reach 80 on the focus axis' },
  },
  {
    id: 'axis-logic-80',
    tier: 3,
    starReward: 60,
    isSecret: false,
    requirement: { kind: 'axis_score', axis: 'logic', value: 80 },
    title: { tr: 'Berrak Mantık', en: 'Clear Logic' },
    description: { tr: 'Mantık ekseninde 80 puana ulaş', en: 'Reach 80 on the logic axis' },
  },
  {
    id: 'axis-speed-80',
    tier: 3,
    starReward: 60,
    isSecret: false,
    requirement: { kind: 'axis_score', axis: 'speed', value: 80 },
    title: { tr: 'Yıldırım', en: 'Lightning' },
    description: { tr: 'Hız ekseninde 80 puana ulaş', en: 'Reach 80 on the speed axis' },
  },
  {
    id: 'axis-problem-80',
    tier: 3,
    starReward: 60,
    isSecret: false,
    requirement: { kind: 'axis_score', axis: 'problemSolving', value: 80 },
    title: { tr: 'Çözücü', en: 'Solver' },
    description: {
      tr: 'Problem çözme ekseninde 80 puana ulaş',
      en: 'Reach 80 on the problem-solving axis',
    },
  },
  {
    id: 'neuropeak-70',
    tier: 3,
    starReward: 70,
    isSecret: false,
    requirement: { kind: 'neuropeak', value: 70 },
    title: { tr: 'Yükselen Grafik', en: 'Rising Curve' },
    description: { tr: 'NeuroPeak skorunu 70’e çıkar', en: 'Raise your NeuroPeak score to 70' },
  },
  {
    id: 'neuropeak-85',
    tier: 4,
    starReward: 150,
    isSecret: false,
    requirement: { kind: 'neuropeak', value: 85 },
    title: { tr: 'Zirve', en: 'Peak' },
    description: { tr: 'NeuroPeak skorunu 85’e çıkar', en: 'Raise your NeuroPeak score to 85' },
  },

  // ------------------------------------------------------------------ lig
  {
    id: 'league-silver',
    tier: 1,
    starReward: 20,
    isSecret: false,
    requirement: { kind: 'league_tier', tier: 'silver' },
    title: { tr: 'Gümüşe Terfi', en: 'Into Silver' },
    description: { tr: 'Gümüş Lig’e yüksel', en: 'Get promoted to Silver League' },
  },
  {
    id: 'league-gold',
    tier: 2,
    starReward: 45,
    isSecret: false,
    requirement: { kind: 'league_tier', tier: 'gold' },
    title: { tr: 'Altına Terfi', en: 'Into Gold' },
    description: { tr: 'Altın Lig’e yüksel', en: 'Get promoted to Gold League' },
  },
  {
    id: 'league-diamond',
    tier: 3,
    starReward: 90,
    isSecret: false,
    requirement: { kind: 'league_tier', tier: 'diamond' },
    title: { tr: 'Elmasa Terfi', en: 'Into Diamond' },
    description: { tr: 'Elmas Lig’e yüksel', en: 'Get promoted to Diamond League' },
  },
  {
    id: 'league-legend',
    tier: 4,
    starReward: 200,
    isSecret: false,
    requirement: { kind: 'league_tier', tier: 'legend' },
    title: { tr: 'Efsane', en: 'Legend' },
    description: { tr: 'Efsane Lig’e yüksel', en: 'Get promoted to Legend League' },
  },
  {
    id: 'weekly-1000',
    tier: 2,
    starReward: 35,
    isSecret: false,
    requirement: { kind: 'weekly_xp', value: 1000 },
    title: { tr: 'Yoğun Hafta', en: 'Busy Week' },
    description: { tr: 'Bir haftada 1.000 XP topla', en: 'Collect 1,000 XP in one week' },
  },

  // ---------------------------------------------------------------- test
  {
    id: 'first-test',
    tier: 1,
    starReward: 20,
    isSecret: false,
    requirement: { kind: 'tests', value: 1 },
    title: { tr: 'İlk Test', en: 'First Test' },
    description: { tr: 'Bir testi tamamla', en: 'Complete a test' },
  },
  {
    id: 'tests-10',
    tier: 3,
    starReward: 70,
    isSecret: false,
    requirement: { kind: 'tests', value: 10 },
    title: { tr: 'Test Koleksiyoncusu', en: 'Test Collector' },
    description: { tr: '10 test tamamla', en: 'Complete 10 tests' },
  },
  {
    id: 'iq-130',
    tier: 4,
    starReward: 150,
    isSecret: false,
    requirement: { kind: 'best_iq', value: 130 },
    title: { tr: 'Yüksek Skor', en: 'High Score' },
    description: { tr: 'Bir testte 130 ve üzeri al', en: 'Score 130 or above on a test' },
  },

  // --------------------------------------------------------------- gizli
  {
    id: 'secret-night-owl',
    tier: 2,
    starReward: 40,
    isSecret: true,
    requirement: { kind: 'rounds', value: 250 },
    title: { tr: 'Gece Kuşu', en: 'Night Owl' },
    description: { tr: 'Gizli rozet — 250 tur oynayarak açıldı', en: 'Secret badge — 250 rounds' },
  },
  {
    id: 'secret-all-rounder',
    tier: 4,
    starReward: 160,
    isSecret: true,
    requirement: { kind: 'neuropeak', value: 95 },
    title: { tr: 'Her Yerde İyi', en: 'All Rounder' },
    description: {
      tr: 'Gizli rozet — NeuroPeak skoru 95’e ulaştı',
      en: 'Secret badge — NeuroPeak score reached 95',
    },
  },
];
