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
  type ContentBadge,
  type ContentDailyTask,
  type ContentGame,
  type ContentQuestion,
  type ContentTest,
  type DailyTaskRow,
  type GameRow,
  type MeasureStepRow,
  type MeasureTest,
  type MeasureTestRow,
  type ProfileOutcomeRow,
  type ProfileQuestionRow,
  type ProfileTest,
  type ProfileTestRow,
  type ProfileTraitRow,
  type QuestionRow,
  type TestRow,
} from '@neuropeak/content';

import { createClient } from './auth';

/**
 * Canlı içerik sorguları.
 *
 * Panel yöneticinin kendi oturumuyla okuyor; `service_role` anahtarı
 * yok. Yöneticinin RLS ilkeleri pasif satırları ve gizli rozetleri de
 * veriyor, yani panel içeriğin tamamını görüyor. Yönetici olmayan bir
 * hesap aynı sorgulardan boş dönüyor ve sayfalar bunu söylüyor.
 *
 * Satır → içerik çevirileri `content-rows.ts`'te ve saf; buradaki tek
 * iş hangi sütunların hangi sırayla çekildiği.
 *
 * İstemciye şema tipi verilmiyor — üretilen `Database` tipi mobil
 * uygulamanın içinde ve panel oraya uzanmıyor — bu yüzden sonuçlar
 * sınırda `content-rows.ts`'teki dar satır tiplerine çevriliyor.
 * Çevrim doğru değilse eşleyici testleri değil, `db:verify`deki
 * seed yakalıyor: içerik şemaya sığmayı bıraktığı anda CI düşüyor.
 */

export async function fetchGames(): Promise<ContentGame[]> {
  const supabase = await createClient();
  if (supabase === null) return [];

  const { data } = await supabase.from('games').select(GAME_COLUMNS).order('sort_order');
  return ((data ?? []) as unknown as GameRow[]).map(toGame);
}

export async function fetchBadges(): Promise<ContentBadge[]> {
  const supabase = await createClient();
  if (supabase === null) return [];

  const { data } = await supabase.from('badges').select(BADGE_COLUMNS).order('sort_order');
  return ((data ?? []) as unknown as BadgeRow[]).map(toBadge);
}

export async function fetchDailyTasks(): Promise<ContentDailyTask[]> {
  const supabase = await createClient();
  if (supabase === null) return [];

  const { data } = await supabase.from('daily_task_templates').select(TASK_COLUMNS).order('id');
  return ((data ?? []) as unknown as DailyTaskRow[]).map(toDailyTask);
}

/**
 * Soru havuzlu testler, soruları dâhil.
 *
 * Havuz paylaşımlı — bir soru birden çok testte geçiyor — bu yüzden
 * sorular `test_questions` üzerinden çekiliyor ve test içindeki sıra
 * o tablodaki `sort_order`dan geliyor.
 */
export async function fetchQuestionTests(): Promise<ContentTest[]> {
  const supabase = await createClient();
  if (supabase === null) return [];

  const { data: tests } = await supabase.from('tests').select(TEST_COLUMNS).order('sort_order');
  const testRows = (tests ?? []) as unknown as TestRow[];
  if (testRows.length === 0) return [];

  const { data: links } = await supabase
    .from('test_questions')
    .select(`test_id, sort_order, questions!inner(${QUESTION_COLUMNS})`)
    .order('sort_order');

  const linkRows = (links ?? []) as unknown as {
    test_id: string;
    questions: QuestionRow;
  }[];

  const byTest = new Map<string, ContentQuestion[]>();
  for (const link of linkRows) {
    byTest.set(link.test_id, [...(byTest.get(link.test_id) ?? []), toQuestion(link.questions)]);
  }

  return testRows.map((test) => toQuestionTest(test, byTest.get(test.id) ?? []));
}

export async function fetchMeasureTests(): Promise<MeasureTest[]> {
  const supabase = await createClient();
  if (supabase === null) return [];

  const { data } = await supabase
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
}

export async function fetchProfileTests(): Promise<ProfileTest[]> {
  const supabase = await createClient();
  if (supabase === null) return [];

  const { data } = await supabase
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
      [...row.profile_questions].sort((a, b) => a.sort_order - b.sort_order).map(toProfileQuestion),
      [...row.profile_outcomes].sort((a, b) => a.sort_order - b.sort_order),
    ),
  );
}
