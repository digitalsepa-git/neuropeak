import {
  BADGES,
  CONTENT_TESTS,
  DAILY_TASKS,
  GAME_CATALOGUE,
  PROFILE_TESTS,
  brainAgeTest,
  type ContentBadge,
  type ContentDailyTask,
  type ContentGame,
  type ContentQuestion,
  type ContentTest,
  type MeasureTest,
  type ProfileTest,
} from '@neuropeak/content';

import {
  fetchBadges,
  fetchDailyTasks,
  fetchGames,
  fetchMeasureTests,
  fetchProfileTests,
  fetchQuestionTests,
} from './content-live';
import { contentMode } from './content-mode';

/**
 * Panelin içerik kaynağı.
 *
 * İki kaynak var ve sayfalar hangisinden okuduklarını bilmiyor:
 *
 *   live     — Supabase bağlı; içerik veritabanından, yöneticinin
 *              kendi oturumuyla okunuyor.
 *   embedded — bağlantı yok; uygulamaya gömülü banka salt okunur
 *              gösteriliyor. Geliştirici ortam değişkenlerini
 *              doldurmadan da paneli gezebilsin diye.
 *
 * Canlı satırlar `content-rows.ts`'te aynı içerik tiplerine
 * çevriliyor, bu yüzden aşağıdaki işlevlerin dönüş tipleri iki modda
 * da aynı. Her biri async: gömülü modda beklemeden dönüyor.
 */

const isLive = contentMode === 'live';

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
function questionTestSummary(test: ContentTest): TestSummary {
  return {
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
  };
}

/** Soru havuzlu testler: Temel IQ, Görsel IQ, Sözel IQ… */
export async function listQuestionTests(): Promise<TestSummary[]> {
  const tests = isLive ? await fetchQuestionTests() : CONTENT_TESTS;
  return tests.map(questionTestSummary);
}

/** Soru sormayan testler: Beyin Yaşı ve üç profil testi. */
export async function listOtherTests(): Promise<TestSummary[]> {
  const [measures, profiles] = await Promise.all([listMeasureTests(), listProfileTests()]);

  return [
    ...measures.map((test) => ({
      id: test.id,
      title: test.title.tr,
      family: 'measures' as const,
      isPro: test.isPro,
      estMinutes: test.estMinutes,
      href: `/content/tests/${test.id}`,
      scale: `${test.steps.length} ölçüm`,
    })),
    ...profiles.map((test) => ({
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

export async function listGames(): Promise<readonly ContentGame[]> {
  return isLive ? fetchGames() : GAME_CATALOGUE;
}

export async function listBadges(): Promise<readonly ContentBadge[]> {
  return isLive ? fetchBadges() : BADGES;
}

export async function listDailyTasks(): Promise<readonly ContentDailyTask[]> {
  return isLive ? fetchDailyTasks() : DAILY_TASKS;
}

async function listMeasureTests(): Promise<readonly MeasureTest[]> {
  return isLive ? fetchMeasureTests() : [brainAgeTest];
}

async function listProfileTests(): Promise<readonly ProfileTest[]> {
  return isLive ? fetchProfileTests() : PROFILE_TESTS;
}

export async function getTest(id: string): Promise<ContentTest | undefined> {
  const tests = isLive ? await fetchQuestionTests() : CONTENT_TESTS;
  return tests.find((test) => test.id === id);
}

export async function getProfileTest(id: string): Promise<ProfileTest | undefined> {
  const tests = await listProfileTests();
  return tests.find((test) => test.id === id);
}

export async function getMeasureTest(id: string): Promise<MeasureTest | undefined> {
  const tests = await listMeasureTests();
  return tests.find((test) => test.id === id);
}

/** Bütün testlerdeki toplam soru sayısı; aynı soru iki testte sayılmaz. */
export async function totalQuestionCount(): Promise<number> {
  const tests = isLive ? await fetchQuestionTests() : CONTENT_TESTS;

  const ids = new Set<string>();
  for (const test of tests) {
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

/**
 * Hangi soru hangi testlerde geçiyor.
 *
 * Havuz paylaşımlı: 182 sorunun 87'si birden fazla testte. Bir
 * soruyu düzenleyen kişi, değişikliğin hangi testlere dokunduğunu
 * görmeden karar veremez.
 */
export async function questionUsage(): Promise<Readonly<Record<string, readonly string[]>>> {
  const tests = isLive ? await fetchQuestionTests() : CONTENT_TESTS;

  const usage: Record<string, string[]> = {};
  for (const test of tests) {
    for (const question of test.questions) {
      usage[question.id] = [...(usage[question.id] ?? []), test.title.tr];
    }
  }
  return usage;
}
