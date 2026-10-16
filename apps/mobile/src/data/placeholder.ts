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

export type PlaceholderGame = {
  id: string;
  title: string;
  category: GameCategory;
  level: number;
  totalLevels: number;
};

export const GAMES: PlaceholderGame[] = [
  { id: 'card-match', title: 'Kart Eşleme', category: 'memory', level: 12, totalLevels: 240 },
  { id: 'n-back', title: 'N-Geri', category: 'memory', level: 4, totalLevels: 0 },
  { id: 'light-sequence', title: 'Işık Dizisi', category: 'memory', level: 9, totalLevels: 0 },
  { id: 'stroop', title: 'Renk Tuzağı', category: 'attention', level: 21, totalLevels: 0 },
  { id: 'odd-one-out', title: 'Farklı Olanı Bul', category: 'attention', level: 7, totalLevels: 0 },
  { id: 'symbol-hunt', title: 'Simge Avı', category: 'attention', level: 3, totalLevels: 0 },
  { id: 'go-no-go', title: 'Dur / Geç', category: 'attention', level: 5, totalLevels: 0 },
  { id: 'matrix', title: 'Matris Bulmaca', category: 'logic', level: 18, totalLevels: 320 },
  { id: 'logic-chain', title: 'Mantık Zinciri', category: 'logic', level: 8, totalLevels: 240 },
  { id: 'liquid-sort', title: 'Sıvı Sıralama', category: 'logic', level: 46, totalLevels: 400 },
  { id: 'one-line', title: 'Tek Çizgi', category: 'logic', level: 31, totalLevels: 315 },
  { id: 'quick-math', title: 'Hızlı İşlem', category: 'math', level: 15, totalLevels: 0 },
  { id: 'number-series', title: 'Sayı Dizisi', category: 'math', level: 22, totalLevels: 280 },
  { id: 'target-number', title: 'Hedef Sayı', category: 'math', level: 9, totalLevels: 300 },
  { id: 'rotation', title: 'Şekil Döndürme', category: 'spatial', level: 6, totalLevels: 0 },
  { id: 'paper-fold', title: 'Katla-Aç', category: 'spatial', level: 11, totalLevels: 200 },
  { id: 'reaction', title: 'Reaksiyon', category: 'speed', level: 28, totalLevels: 0 },
  { id: 'anagram', title: 'Kelime Avı', category: 'verbal', level: 14, totalLevels: 260 },
];

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

export type LeagueRow = {
  rank: number;
  name: string;
  xp: number;
  isCurrentUser?: boolean;
};

export const LEAGUE_ROWS: LeagueRow[] = [
  { rank: 1, name: 'Deniz K.', xp: 4820 },
  { rank: 2, name: 'Mert A.', xp: 4410 },
  { rank: 3, name: 'Elif S.', xp: 4105 },
  { rank: 4, name: 'Sen', xp: 3870, isCurrentUser: true },
  { rank: 5, name: 'Burak T.', xp: 3640 },
  { rank: 6, name: 'Ayşe Y.', xp: 3380 },
  { rank: 7, name: 'Can Ö.', xp: 3120 },
];

/** Beyin haritasının eksen puanları — gerçek radar grafiği PR#16'da. */
export const BRAIN_MAP_SCORES = {
  memory: 72,
  focus: 64,
  logic: 81,
  speed: 55,
  problemSolving: 69,
} as const;

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
