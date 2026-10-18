import type { Localized } from '@neuropeak/core';

/**
 * GEÇİCİ VERİ — sekme iskeletinin dolu görünmesi için.
 * Gerçek içerik Supabase'den gelecek (PR#5), oyunlar PR#9–15,
 * testler PR#6 ve PR#19, lig PR#17 ile bağlanacak.
 *
 * Kategori ve eksen adları i18n kataloğuna taşındı; buradaki tek
 * metin, soru bankası henüz yazılmamış testlerin adları.
 */

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
  title: Localized;
  questions: number;
  minutes: string;
  group: 'iq' | 'fun';
  pro: boolean;
};

export const TESTS: PlaceholderTest[] = [
  {
    id: 'basic-iq',
    title: { tr: 'Temel IQ Testi', en: 'Basic IQ Test' },
    questions: 20,
    minutes: '8-12',
    group: 'iq',
    pro: false,
  },
  {
    id: 'advanced-iq',
    title: { tr: 'İleri IQ Testi', en: 'Advanced IQ Test' },
    questions: 60,
    minutes: '15-18',
    group: 'iq',
    pro: true,
  },
  {
    id: 'visual-iq',
    title: { tr: 'Görsel IQ Testi', en: 'Visual IQ Test' },
    questions: 20,
    minutes: '8-12',
    group: 'iq',
    pro: true,
  },
  {
    // Soru bankası PR#20'de yazılmıştı ama bu listeye eklenmediği
    // için teste hiç ulaşılamıyordu.
    id: 'logic-reasoning',
    title: { tr: 'Mantıksal Akıl Yürütme', en: 'Logical Reasoning' },
    questions: 25,
    minutes: '8-12',
    group: 'iq',
    pro: true,
  },
  {
    id: 'numeric-iq',
    title: { tr: 'Sayısal IQ Testi', en: 'Numeric IQ Test' },
    questions: 30,
    minutes: '10-12',
    group: 'iq',
    pro: true,
  },
  {
    id: 'verbal-iq',
    title: { tr: 'Sözel IQ Testi', en: 'Verbal IQ Test' },
    questions: 25,
    minutes: '8-10',
    group: 'iq',
    pro: true,
  },
  {
    id: 'quick-iq',
    title: { tr: 'Hızlı IQ Testi', en: 'Quick IQ Test' },
    questions: 12,
    minutes: '4-5',
    group: 'iq',
    pro: true,
  },
  {
    // Soru sormuyor, dört ölçüm yaptırıyor; sayılar kendi
    // tanımından geliyor ve bu satırdakiler kullanılmıyor.
    id: 'brain-age',
    title: { tr: 'Beyin Yaşı Testi', en: 'Brain Age Test' },
    questions: 0,
    minutes: '3-5',
    group: 'fun',
    pro: true,
  },
  {
    id: 'archetype',
    title: { tr: 'Zihin Arketipin', en: 'Your Mind Archetype' },
    questions: 8,
    minutes: '2-3',
    group: 'fun',
    pro: true,
  },
  {
    id: 'focus-profile',
    title: { tr: 'Odaklanma Profili', en: 'Focus Profile' },
    questions: 8,
    minutes: '2-3',
    group: 'fun',
    pro: true,
  },
  {
    id: 'persona-map',
    title: { tr: 'Kişilik Haritası', en: 'Personality Map' },
    questions: 10,
    minutes: '3-4',
    group: 'fun',
    pro: true,
  },
];
