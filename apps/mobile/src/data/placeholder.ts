import type { GameCategory } from '@neuropeak/core';

/**
 * GEÇİCİ VERİ — sekme iskeletinin dolu görünmesi için.
 * Gerçek içerik Supabase'den gelecek (PR#5), oyunlar PR#9–15,
 * testler PR#6 ve PR#19, lig PR#17 ile bağlanacak.
 */

/** Kategori adları PR#24'te i18n'e taşınacak. */
export const CATEGORY_LABELS: Record<GameCategory, string> = {
  memory: 'Hafıza',
  attention: 'Odaklanma',
  logic: 'Mantık',
  math: 'Matematik',
  spatial: 'Görsel',
  speed: 'Hız',
  verbal: 'Sözel',
};

/**
 * GEÇİCİ — oyun başına ilerleme henüz kaydedilmiyor. Oyunlar sekmesi
 * kartları dolu göstersin diye bu değerleri kullanıyor; gerçek
 * ilerleme kaydı eklendiğinde bu tablo silinecek.
 */
export const GAME_PROGRESS: Record<string, number> = {
  'card-match': 12,
  'n-back': 4,
  'light-sequence': 9,
  'grid-recall': 11,
  stroop: 21,
  'odd-one-out': 7,
  'symbol-hunt': 3,
  'go-no-go': 5,
  tracking: 6,
  matrix: 18,
  'logic-chain': 8,
  'liquid-sort': 46,
  'one-line': 31,
  connect: 17,
  maze: 24,
  'quick-math': 15,
  'number-series': 22,
  'target-number': 9,
  balance: 19,
  rotation: 6,
  'shadow-match': 4,
  'paper-fold': 11,
  tiling: 7,
  reaction: 28,
  'quick-decision': 13,
  anagram: 14,
  'word-analogy': 5,
  'word-link': 8,
};

export type PlaceholderTest = {
  id: string;
  title: string;
  questions: number;
  minutes: string;
  group: 'iq' | 'fun';
  pro: boolean;
};

export const TESTS: PlaceholderTest[] = [
  {
    id: 'basic-iq',
    title: 'Temel IQ Testi',
    questions: 20,
    minutes: '8-12',
    group: 'iq',
    pro: false,
  },
  {
    id: 'advanced-iq',
    title: 'İleri IQ Testi',
    questions: 60,
    minutes: '15-18',
    group: 'iq',
    pro: true,
  },
  {
    id: 'visual-iq',
    title: 'Görsel IQ Testi',
    questions: 30,
    minutes: '10-12',
    group: 'iq',
    pro: true,
  },
  {
    id: 'numeric-iq',
    title: 'Sayısal IQ Testi',
    questions: 30,
    minutes: '10-12',
    group: 'iq',
    pro: true,
  },
  {
    id: 'verbal-iq',
    title: 'Sözel IQ Testi',
    questions: 25,
    minutes: '8-10',
    group: 'iq',
    pro: true,
  },
  {
    id: 'quick-iq',
    title: 'Hızlı IQ Testi',
    questions: 12,
    minutes: '4-5',
    group: 'iq',
    pro: true,
  },
  {
    id: 'brain-age',
    title: 'Beyin Yaşı Testi',
    questions: 15,
    minutes: '6-8',
    group: 'fun',
    pro: true,
  },
  {
    id: 'archetype',
    title: 'Zihin Arketipin',
    questions: 24,
    minutes: '6-7',
    group: 'fun',
    pro: true,
  },
  {
    id: 'focus-profile',
    title: 'Odaklanma Profili',
    questions: 20,
    minutes: '7-8',
    group: 'fun',
    pro: true,
  },
];

export type DailyTask = {
  id: string;
  title: string;
  done: number;
  target: number;
  reward: number;
};

export const DAILY_TASKS: DailyTask[] = [
  { id: 'play-memory', title: '2 hafıza oyunu oyna', done: 1, target: 2, reward: 15 },
  { id: 'earn-xp', title: '500 XP kazan', done: 320, target: 500, reward: 20 },
  { id: 'finish-test', title: 'Bir testi tamamla', done: 0, target: 1, reward: 30 },
];

export const AXIS_LABELS = {
  memory: 'Hafıza',
  focus: 'Odaklanma',
  logic: 'Mantık',
  speed: 'Hız',
  problemSolving: 'Problem Çözme',
} as const;

export const USER = {
  starBalance: 103,
  streakDays: 3,
  level: 12,
  levelProgress: 0.45,
  neuropeakScore: 68,
  isPro: false,
} as const;
