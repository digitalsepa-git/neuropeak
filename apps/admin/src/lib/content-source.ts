import {
  CONTENT_TESTS,
  findTest,
  type ContentQuestion,
  type ContentTest,
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

export type TestSummary = {
  readonly id: string;
  readonly title: string;
  readonly kind: ContentTest['kind'];
  readonly questionCount: number;
  readonly poolSize: number;
  readonly isPro: boolean;
  readonly focus: ContentTest['focus'];
  readonly estMinutes: readonly [number, number];
  /** Havuzdaki soruların ortalama zorluk ağırlığı. */
  readonly averageWeight: number;
};

function averageWeight(questions: readonly ContentQuestion[]): number {
  if (questions.length === 0) return 0;
  const total = questions.reduce((sum, question) => sum + question.difficultyWeight, 0);
  return Math.round((total / questions.length) * 100) / 100;
}

export function listTests(): TestSummary[] {
  return CONTENT_TESTS.map((test) => ({
    id: test.id,
    title: test.title.tr,
    kind: test.kind,
    questionCount: test.questionCount,
    poolSize: test.questions.length,
    isPro: test.isPro,
    focus: test.focus,
    estMinutes: test.estMinutes,
    averageWeight: averageWeight(test.questions),
  }));
}

export function getTest(id: string): ContentTest | undefined {
  return findTest(id);
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
