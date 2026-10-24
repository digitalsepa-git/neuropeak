import {
  CONTENT_TESTS,
  PROFILE_TESTS,
  brainAgeTest,
  findProfileTest,
  findTest,
  type ContentQuestion,
  type ContentTest,
  type ProfileTest,
} from '@neuropeak/content';

import { isSupabaseConfigured } from './supabase';

/**
 * Panelin içerik kaynağı.
 *
 * Supabase bağlıysa testler ve sorular oradan okunup yazılacak.
 * Bağlı değilken panel, mobil uygulamanın gömülü içeriğini salt okunur
 * gösteriyor: boş bir panel yerine gerçek bankayı görmek, yapıyı ve
 * ekranları denemek için yeterli. Yazma işlemleri bu modda kapalı ve
 * arayüz bunu açıkça söylüyor.
 */

export type ContentMode = 'live' | 'embedded';

export const contentMode: ContentMode = isSupabaseConfigured ? 'live' : 'embedded';

export const canEditContent = contentMode === 'live';

/**
 * Testin hangi türden olduğu.
 *
 * Uygulamada üç tür test var ve panelin üçünü de göstermesi gerekiyor:
 * soru havuzlu IQ testleri, ölçüm yaptıran Beyin Yaşı ve eksen puanı
 * veren profil testleri. Önceden yalnızca ilki listeleniyordu, yani
 * panel on bir testin yedisini gösteriyordu.
 *
 * Her tür farklı sayılar taşıyor; ortak bir satıra sıkıştırmak yerine
 * tür ayrımı burada duruyor ve tablo her türe kendi sütununu veriyor.
 */
export type TestFamily = 'questions' | 'measures' | 'profile';

export type TestSummary = {
  readonly id: string;
  readonly title: string;
  readonly family: TestFamily;
  readonly isPro: boolean;
  readonly estMinutes: readonly [number, number];
  /** Panel yolunu kurar; tür başına farklı ekran var. */
  readonly href: string;
  /** Türe göre değişen tek satırlık özet: havuz, ölçüm ya da eksen. */
  readonly scale: string;
  /** Soru havuzlu testler için; diğerlerinde undefined. */
  readonly questions?: {
    readonly kind: ContentTest['kind'];
    readonly focus: ContentTest['focus'];
    readonly asked: number;
    readonly poolSize: number;
    readonly averageWeight: number;
  };
};

function averageWeight(questions: readonly ContentQuestion[]): number {
  if (questions.length === 0) return 0;
  const total = questions.reduce((sum, question) => sum + question.difficultyWeight, 0);
  return Math.round((total / questions.length) * 100) / 100;
}

/** Soru havuzlu testler: Temel IQ, Görsel IQ, Sözel IQ… */
export function listQuestionTests(): TestSummary[] {
  return CONTENT_TESTS.map((test) => ({
    id: test.id,
    title: test.title.tr,
    family: 'questions' as const,
    isPro: test.isPro,
    estMinutes: test.estMinutes,
    href: `/content/tests/${test.id}`,
    scale: `${test.questions.length} soruluk havuz`,
    questions: {
      kind: test.kind,
      focus: test.focus,
      asked: test.questionCount,
      poolSize: test.questions.length,
      averageWeight: averageWeight(test.questions),
    },
  }));
}

/** Soru sormayan testler: Beyin Yaşı ve üç profil testi. */
export function listOtherTests(): TestSummary[] {
  return [
    {
      id: brainAgeTest.id,
      title: brainAgeTest.title.tr,
      family: 'measures' as const,
      isPro: brainAgeTest.isPro,
      estMinutes: brainAgeTest.estMinutes,
      href: `/content/tests/${brainAgeTest.id}`,
      scale: `${brainAgeTest.steps.length} ölçüm`,
    },
    ...PROFILE_TESTS.map((test) => ({
      id: test.id,
      title: test.title.tr,
      family: 'profile' as const,
      isPro: test.isPro,
      estMinutes: test.estMinutes,
      href: `/content/tests/${test.id}`,
      scale: `${test.questions.length} soru · ${test.traits.length} eksen`,
    })),
  ];
}

/** Uygulamanın gerçekten sunduğu bütün testler. */
export function listTests(): TestSummary[] {
  return [...listQuestionTests(), ...listOtherTests()];
}

export function getTest(id: string): ContentTest | undefined {
  return findTest(id);
}

export function getProfileTest(id: string): ProfileTest | undefined {
  return findProfileTest(id);
}

/** Beyin Yaşı tek örnek; kimlik eşleşiyorsa o. */
export function getMeasureTest(id: string): typeof brainAgeTest | undefined {
  return id === brainAgeTest.id ? brainAgeTest : undefined;
}

/** Bütün testlerdeki toplam soru sayısı; aynı soru iki testte sayılmaz. */
export function totalQuestionCount(): number {
  const ids = new Set<string>();
  for (const test of CONTENT_TESTS) {
    for (const question of test.questions) ids.add(question.id);
  }
  return ids.size;
}

export type KindBreakdown = { readonly kind: string; readonly count: number };

export function kindBreakdown(questions: readonly ContentQuestion[]): KindBreakdown[] {
  const counts = new Map<string, number>();
  for (const question of questions) {
    counts.set(question.kind, (counts.get(question.kind) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([kind, count]) => ({ kind, count }))
    .sort((a, b) => b.count - a.count || (a.kind < b.kind ? -1 : 1));
}
