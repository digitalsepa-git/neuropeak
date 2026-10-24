import {
  BADGE_COLUMNS,
  GAME_COLUMNS,
  MEASURE_TEST_COLUMNS,
  PROFILE_TEST_COLUMNS,
  QUESTION_COLUMNS,
  TASK_COLUMNS,
  TEST_COLUMNS,
  toBadge,
  toDailyTask,
  toGame,
  toMeasureStep,
  toMeasureTest,
  toProfileQuestion,
  toProfileTest,
  toProfileTrait,
  toQuestion,
  toQuestionTest,
  type BadgeRow,
  type ContentQuestion,
  type DailyTaskRow,
  type GameRow,
  type MeasureStepRow,
  type MeasureTestRow,
  type ProfileOutcomeRow,
  type ProfileQuestionRow,
  type ProfileTestRow,
  type ProfileTraitRow,
  type QuestionRow,
  type TestRow,
} from '@neuropeak/content';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

import type { Catalogue } from './catalogue';

/**
 * İçeriği veritabanından çeker.
 *
 * Okuma ilkeleri yalnızca yayındaki satırları veriyor, yani
 * uygulamanın ayrıca süzmesi gerekmiyor. Sorgular paralel: altısı
 * birbirinden bağımsız ve biri yavaşsa diğerlerini bekletmesin.
 *
 * Hata yutuluyor ve o bölüm boş dönüyor: içerik çekilemediğinde
 * uygulama gömülü bankayla çalışmaya devam etmeli, çökmemeli.
 * Çeviriler `@neuropeak/content`'te ve panelle ortak.
 */

async function safely<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch {
    return fallback;
  }
}

export async function fetchCatalogue(): Promise<Partial<Catalogue>> {
  if (!isSupabaseConfigured || supabase === null) return {};

  const client = supabase;

  const [games, tests, badges, dailyTasks, profileTests, measureTests] = await Promise.all([
    safely(async () => {
      const { data } = await client.from('games').select(GAME_COLUMNS).order('sort_order');
      return ((data ?? []) as unknown as GameRow[]).map(toGame);
    }, []),

    safely(async () => {
      const { data } = await client.from('tests').select(TEST_COLUMNS).order('sort_order');
      const rows = (data ?? []) as unknown as TestRow[];
      if (rows.length === 0) return [];

      const { data: links } = await client
        .from('test_questions')
        .select(`test_id, questions!inner(${QUESTION_COLUMNS})`)
        .order('sort_order');

      const linkRows = (links ?? []) as unknown as {
        test_id: string;
        questions: QuestionRow;
      }[];

      const byTest = new Map<string, ContentQuestion[]>();
      for (const link of linkRows) {
        byTest.set(link.test_id, [...(byTest.get(link.test_id) ?? []), toQuestion(link.questions)]);
      }

      return rows.map((row) => toQuestionTest(row, byTest.get(row.id) ?? []));
    }, []),

    safely(async () => {
      const { data } = await client.from('badges').select(BADGE_COLUMNS).order('sort_order');
      return ((data ?? []) as unknown as BadgeRow[]).map(toBadge);
    }, []),

    safely(async () => {
      const { data } = await client.from('daily_task_templates').select(TASK_COLUMNS).order('id');
      return ((data ?? []) as unknown as DailyTaskRow[]).map(toDailyTask);
    }, []),

    safely(async () => {
      const { data } = await client
        .from('profile_tests')
        .select(PROFILE_TEST_COLUMNS)
        .order('sort_order');

      const rows = (data ?? []) as unknown as (ProfileTestRow & {
        profile_traits: (ProfileTraitRow & { sort_order: number })[];
        profile_questions: (ProfileQuestionRow & { sort_order: number })[];
        profile_outcomes: (ProfileOutcomeRow & { sort_order: number })[];
      })[];

      return rows.map((row) =>
        toProfileTest(
          row,
          [...row.profile_traits].sort((a, b) => a.sort_order - b.sort_order).map(toProfileTrait),
          [...row.profile_questions]
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(toProfileQuestion),
          [...row.profile_outcomes].sort((a, b) => a.sort_order - b.sort_order),
        ),
      );
    }, []),

    safely(async () => {
      const { data } = await client
        .from('measure_tests')
        .select(MEASURE_TEST_COLUMNS)
        .order('sort_order');

      const rows = (data ?? []) as unknown as (MeasureTestRow & {
        measure_steps: (MeasureStepRow & { sort_order: number })[];
      })[];

      return rows.map((row) =>
        toMeasureTest(
          row,
          [...row.measure_steps].sort((a, b) => a.sort_order - b.sort_order).map(toMeasureStep),
        ),
      );
    }, []),
  ]);

  return { games, tests, badges, dailyTasks, profileTests, measureTests };
}
