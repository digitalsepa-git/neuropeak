// Gömülü içerik bankasını veritabanına yazar.
//
// İçerik bugün kodda duruyor ve uygulama onu paketten okuyor. Panelin
// canlı veriden okuyabilmesi için önce aynı içeriğin veritabanında
// olması gerekiyor; bu betik o köprü.
//
// SQL üretip `psql`'e veriyor — `generate-db-types.mjs` ile aynı
// yaklaşım, yeni bir bağımlılık getirmiyor ve barındırılan bir
// Supabase'e de aynı şekilde uygulanıyor.
//
//   scripts/seed-content.sh                 → DATABASE_URL'e uygular
//   scripts/seed-content.sh --sql           → SQL'i yazdırır, uygulamaz
//
// Yeniden çalıştırmak güvenli: her satır kimliğine göre upsert
// ediliyor. Katalogdan çıkmış bir kayıt silinmiyor, `is_active = false`
// yapılıyor — kullanıcı verisi (oynanmış oyun, çözülmüş soru) ona
// bağlı olabilir ve silmek o geçmişi de götürürdü.

import { execFileSync } from 'node:child_process';

import {
  BADGES,
  CONTENT_TESTS,
  DAILY_TASKS,
  GAME_CATALOGUE,
  PROFILE_TESTS,
  brainAgeTest,
  type ContentQuestion,
  type ProfileOutcome,
  type ProfileTest,
} from '@neuropeak/content';

/** SQL metin değişmezi; tek tırnak ikileniyor. */
function text(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function nullableText(value: string | undefined): string {
  return value === undefined ? 'null' : text(value);
}

function json(value: unknown): string {
  return `${text(JSON.stringify(value))}::jsonb`;
}

function nullableJson(value: unknown): string {
  return value === undefined ? 'null' : json(value);
}

/**
 * Katalogda olmayan satırları pasife alır.
 *
 * Silmek yerine pasife almak, kullanıcı verisindeki yabancı
 * anahtarları koruyor; okuma ilkeleri zaten yalnızca aktif satırları
 * veriyor, yani uygulamada görünmüyorlar.
 */
function deactivateMissing(table: string, column: string, ids: readonly string[]): string {
  const list = ids.map(text).join(', ');
  return `update public.${table} set is_active = false where ${column} not in (${list}) and is_active;`;
}

function values(rows: readonly string[]): string {
  return rows.map((row) => `  (${row})`).join(',\n');
}

function gamesSql(): string {
  const rows = GAME_CATALOGUE.map((game, index) =>
    [
      text(game.id),
      `${text(game.category)}::public.game_category`,
      `${text(game.mode)}::public.game_mode`,
      text(game.title.tr),
      text(game.title.en),
      text(game.description.tr),
      text(game.description.en),
      text(game.instruction.tr),
      text(game.instruction.en),
      json(game.skills),
      `${game.totalLevels}`,
      `${game.baseXp}`,
      `${index}`,
    ].join(', '),
  );

  return `insert into public.games (
  id, category, mode, title_tr, title_en, description_tr, description_en,
  instruction_tr, instruction_en, skills, total_levels, xp_per_round, sort_order
) values
${values(rows)}
on conflict (id) do update set
  category = excluded.category,
  mode = excluded.mode,
  title_tr = excluded.title_tr,
  title_en = excluded.title_en,
  description_tr = excluded.description_tr,
  description_en = excluded.description_en,
  instruction_tr = excluded.instruction_tr,
  instruction_en = excluded.instruction_en,
  skills = excluded.skills,
  total_levels = excluded.total_levels,
  xp_per_round = excluded.xp_per_round,
  sort_order = excluded.sort_order,
  is_active = true;

${deactivateMissing(
  'games',
  'id',
  GAME_CATALOGUE.map((game) => game.id),
)}`;
}

function testsSql(): string {
  const rows = CONTENT_TESTS.map((test, index) =>
    [
      text(test.id),
      `${text(test.kind)}::public.test_kind`,
      text(test.title.tr),
      text(test.title.en),
      text(test.description.tr),
      text(test.description.en),
      `${test.questionCount}`,
      `${test.estMinutes[0]}`,
      `${test.estMinutes[1]}`,
      test.isPro ? 'true' : 'false',
      test.focus === undefined ? 'null' : `${text(test.focus)}::public.report_dimension`,
      `${test.norm.mean}`,
      `${test.norm.sd}`,
      `${index}`,
    ].join(', '),
  );

  return `insert into public.tests (
  id, kind, title_tr, title_en, description_tr, description_en,
  question_count, est_minutes_min, est_minutes_max, is_pro, focus,
  norm_mean, norm_sd, sort_order
) values
${values(rows)}
on conflict (id) do update set
  kind = excluded.kind,
  title_tr = excluded.title_tr,
  title_en = excluded.title_en,
  description_tr = excluded.description_tr,
  description_en = excluded.description_en,
  question_count = excluded.question_count,
  est_minutes_min = excluded.est_minutes_min,
  est_minutes_max = excluded.est_minutes_max,
  is_pro = excluded.is_pro,
  focus = excluded.focus,
  norm_mean = excluded.norm_mean,
  norm_sd = excluded.norm_sd,
  sort_order = excluded.sort_order,
  is_active = true;

${deactivateMissing(
  'tests',
  'id',
  CONTENT_TESTS.map((test) => test.id),
)}`;
}

function questionRow(question: ContentQuestion): string {
  return [
    text(question.id),
    `${text(question.kind)}::public.question_kind`,
    text(question.prompt.tr),
    text(question.prompt.en),
    json(question.options),
    `${question.correctIndex}`,
    `${question.difficultyWeight}`,
    nullableText(question.explanation?.tr),
    nullableText(question.explanation?.en),
    nullableJson(question.visual),
  ].join(', ');
}

/**
 * Soru havuzu.
 *
 * Havuz paylaşımlı: aynı soru birden çok testte geçiyor, bu yüzden
 * soru bir kez yazılıyor ve hangi teste girdiği `test_questions`'ta
 * duruyor. Aynı soruyu her test için kopyalamak, bir soruyu
 * düzeltince öbür kopyayı unutmak demekti.
 */
function questionsSql(): string {
  const unique = new Map<string, ContentQuestion>();
  for (const test of CONTENT_TESTS) {
    for (const question of test.questions) {
      unique.set(question.id, question);
    }
  }

  const rows = [...unique.values()].map(questionRow);

  return `insert into public.questions (
  slug, kind, prompt_tr, prompt_en, options, correct_index,
  difficulty_weight, explanation_tr, explanation_en, visual
) values
${values(rows)}
on conflict (slug) do update set
  kind = excluded.kind,
  prompt_tr = excluded.prompt_tr,
  prompt_en = excluded.prompt_en,
  options = excluded.options,
  correct_index = excluded.correct_index,
  difficulty_weight = excluded.difficulty_weight,
  explanation_tr = excluded.explanation_tr,
  explanation_en = excluded.explanation_en,
  visual = excluded.visual,
  is_active = true;

${deactivateMissing('questions', 'slug', [...unique.keys()])}`;
}

/** Hangi soru hangi teste, hangi sırayla giriyor. */
function testQuestionsSql(): string {
  const rows: string[] = [];
  const pairs: string[] = [];

  for (const test of CONTENT_TESTS) {
    test.questions.forEach((question, index) => {
      rows.push(
        `${text(test.id)}, (select id from public.questions where slug = ${text(question.id)}), ${index}`,
      );
      pairs.push(`(${text(test.id)}, ${text(question.id)})`);
    });
  }

  // Katalogdan çıkmış eşleşmeler siliniyor. Burada silmek güvenli:
  // satır yalnızca "bu soru bu teste giriyor" bilgisini taşıyor,
  // kullanıcı verisi ona bağlı değil.
  const keep = pairs.join(', ');

  return `insert into public.test_questions (test_id, question_id, sort_order) values
${values(rows)}
on conflict (test_id, question_id) do update set sort_order = excluded.sort_order;

delete from public.test_questions tq
using public.questions q
where q.id = tq.question_id
  and (tq.test_id, q.slug) not in (${keep});`;
}

/**
 * Beyin Yaşı. Soru sormuyor, dört ölçüm yaptırıyor; bu yüzden kendi
 * tablosunda duruyor. Bugün tek örnek, ama tablo bir listeyi tutuyor.
 */
function measureTestsSql(): string {
  const row = [
    text(brainAgeTest.id),
    text(brainAgeTest.title.tr),
    text(brainAgeTest.title.en),
    text(brainAgeTest.description.tr),
    text(brainAgeTest.description.en),
    text(brainAgeTest.caveat.tr),
    text(brainAgeTest.caveat.en),
    `${brainAgeTest.estMinutes[0]}`,
    `${brainAgeTest.estMinutes[1]}`,
    brainAgeTest.isPro ? 'true' : 'false',
    '0',
  ].join(', ');

  const steps = brainAgeTest.steps.map((step, index) =>
    [
      text(brainAgeTest.id),
      `${text(step.measure)}::public.brain_age_measure`,
      text(step.title.tr),
      text(step.title.en),
      text(step.instruction.tr),
      text(step.instruction.en),
      `${step.seconds}`,
      `${index}`,
    ].join(', '),
  );

  return `insert into public.measure_tests (
  id, title_tr, title_en, description_tr, description_en,
  caveat_tr, caveat_en, est_minutes_min, est_minutes_max, is_pro, sort_order
) values
  (${row})
on conflict (id) do update set
  title_tr = excluded.title_tr,
  title_en = excluded.title_en,
  description_tr = excluded.description_tr,
  description_en = excluded.description_en,
  caveat_tr = excluded.caveat_tr,
  caveat_en = excluded.caveat_en,
  est_minutes_min = excluded.est_minutes_min,
  est_minutes_max = excluded.est_minutes_max,
  is_pro = excluded.is_pro,
  sort_order = excluded.sort_order,
  is_active = true;

${deactivateMissing('measure_tests', 'id', [brainAgeTest.id])}

insert into public.measure_steps (
  test_id, measure, title_tr, title_en, instruction_tr, instruction_en, seconds, sort_order
) values
${values(steps)}
on conflict (test_id, measure) do update set
  title_tr = excluded.title_tr,
  title_en = excluded.title_en,
  instruction_tr = excluded.instruction_tr,
  instruction_en = excluded.instruction_en,
  seconds = excluded.seconds,
  sort_order = excluded.sort_order;

delete from public.measure_steps
where (test_id, measure::text) not in (${brainAgeTest.steps
    .map((step) => `(${text(brainAgeTest.id)}, ${text(step.measure)})`)
    .join(', ')});`;
}

function profileTestsSql(): string {
  const rows = PROFILE_TESTS.map((test, index) =>
    [
      text(test.id),
      text(test.title.tr),
      text(test.title.en),
      text(test.description.tr),
      text(test.description.en),
      text(test.caveat.tr),
      text(test.caveat.en),
      `${test.estMinutes[0]}`,
      `${test.estMinutes[1]}`,
      test.isPro ? 'true' : 'false',
      `${index}`,
    ].join(', '),
  );

  return `insert into public.profile_tests (
  id, title_tr, title_en, description_tr, description_en,
  caveat_tr, caveat_en, est_minutes_min, est_minutes_max, is_pro, sort_order
) values
${values(rows)}
on conflict (id) do update set
  title_tr = excluded.title_tr,
  title_en = excluded.title_en,
  description_tr = excluded.description_tr,
  description_en = excluded.description_en,
  caveat_tr = excluded.caveat_tr,
  caveat_en = excluded.caveat_en,
  est_minutes_min = excluded.est_minutes_min,
  est_minutes_max = excluded.est_minutes_max,
  is_pro = excluded.is_pro,
  sort_order = excluded.sort_order,
  is_active = true;

${deactivateMissing(
  'profile_tests',
  'id',
  PROFILE_TESTS.map((test) => test.id),
)}`;
}

/** Eksen kimliği test içinde tekil; anahtar bu yüzden (test, eksen). */
function profileTraitsSql(): string {
  const rows: string[] = [];
  const keep: string[] = [];

  for (const test of PROFILE_TESTS) {
    test.traits.forEach((trait, index) => {
      rows.push(
        [
          text(test.id),
          text(trait.id),
          text(trait.label.tr),
          text(trait.label.en),
          text(trait.description.tr),
          text(trait.description.en),
          `${index}`,
        ].join(', '),
      );
      keep.push(`(${text(test.id)}, ${text(trait.id)})`);
    });
  }

  return `insert into public.profile_traits (
  test_id, id, label_tr, label_en, description_tr, description_en, sort_order
) values
${values(rows)}
on conflict (test_id, id) do update set
  label_tr = excluded.label_tr,
  label_en = excluded.label_en,
  description_tr = excluded.description_tr,
  description_en = excluded.description_en,
  sort_order = excluded.sort_order;

delete from public.profile_traits where (test_id, id) not in (${keep.join(', ')});`;
}

function profileQuestionsSql(): string {
  const rows: string[] = [];
  const keep: string[] = [];

  for (const test of PROFILE_TESTS) {
    test.questions.forEach((question, index) => {
      rows.push(
        [
          text(test.id),
          text(question.id),
          text(question.prompt.tr),
          text(question.prompt.en),
          json(question.options),
          `${index}`,
        ].join(', '),
      );
      keep.push(`(${text(test.id)}, ${text(question.id)})`);
    });
  }

  return `insert into public.profile_questions (
  test_id, slug, prompt_tr, prompt_en, options, sort_order
) values
${values(rows)}
on conflict (test_id, slug) do update set
  prompt_tr = excluded.prompt_tr,
  prompt_en = excluded.prompt_en,
  options = excluded.options,
  sort_order = excluded.sort_order,
  is_active = true;

update public.profile_questions set is_active = false
where (test_id, slug) not in (${keep.join(', ')}) and is_active;`;
}

/**
 * Arketipler.
 *
 * `balanced` içerikte `outcomes` dizisinin dışında duruyor çünkü
 * sıralamaya girmiyor: hiçbir eksen öne çıkmadığında gösteriliyor.
 * Tabloda aynı listede, `is_balanced` bayrağıyla.
 */
function profileOutcomesSql(): string {
  const rows: string[] = [];
  const keep: string[] = [];

  const add = (test: ProfileTest, outcome: ProfileOutcome, index: number, balanced: boolean) => {
    rows.push(
      [
        text(test.id),
        text(outcome.id),
        text(outcome.title.tr),
        text(outcome.title.en),
        text(outcome.description.tr),
        text(outcome.description.en),
        json(outcome.traits),
        balanced ? 'true' : 'false',
        `${index}`,
      ].join(', '),
    );
    keep.push(`(${text(test.id)}, ${text(outcome.id)})`);
  };

  for (const test of PROFILE_TESTS) {
    (test.outcomes ?? []).forEach((outcome, index) => add(test, outcome, index, false));
    if (test.balanced !== undefined) {
      add(test, test.balanced, (test.outcomes ?? []).length, true);
    }
  }

  if (rows.length === 0) return 'delete from public.profile_outcomes;';

  return `insert into public.profile_outcomes (
  test_id, id, title_tr, title_en, description_tr, description_en,
  traits, is_balanced, sort_order
) values
${values(rows)}
on conflict (test_id, id) do update set
  title_tr = excluded.title_tr,
  title_en = excluded.title_en,
  description_tr = excluded.description_tr,
  description_en = excluded.description_en,
  traits = excluded.traits,
  is_balanced = excluded.is_balanced,
  sort_order = excluded.sort_order;

delete from public.profile_outcomes where (test_id, id) not in (${keep.join(', ')});`;
}

function badgesSql(): string {
  const rows = BADGES.map((badge, index) =>
    [
      text(badge.id),
      text(badge.title.tr),
      text(badge.title.en),
      text(badge.description.tr),
      text(badge.description.en),
      `${badge.tier}`,
      `${badge.starReward}`,
      badge.isSecret ? 'true' : 'false',
      json(badge.requirement),
      `${index}`,
    ].join(', '),
  );

  return `insert into public.badges (
  id, title_tr, title_en, description_tr, description_en,
  tier, star_reward, is_secret, requirement, sort_order
) values
${values(rows)}
on conflict (id) do update set
  title_tr = excluded.title_tr,
  title_en = excluded.title_en,
  description_tr = excluded.description_tr,
  description_en = excluded.description_en,
  tier = excluded.tier,
  star_reward = excluded.star_reward,
  is_secret = excluded.is_secret,
  requirement = excluded.requirement,
  sort_order = excluded.sort_order,
  is_active = true;

${deactivateMissing(
  'badges',
  'id',
  BADGES.map((badge) => badge.id),
)}`;
}

function tasksSql(): string {
  const rows = DAILY_TASKS.map((task) =>
    [
      text(task.id),
      text(task.title.tr),
      text(task.title.en),
      text(task.metric),
      `${task.target}`,
      task.category === undefined ? 'null' : `${text(task.category)}::public.game_category`,
      `${task.starReward}`,
    ].join(', '),
  );

  return `insert into public.daily_task_templates (
  id, title_tr, title_en, metric, target, category, star_reward
) values
${values(rows)}
on conflict (id) do update set
  title_tr = excluded.title_tr,
  title_en = excluded.title_en,
  metric = excluded.metric,
  target = excluded.target,
  category = excluded.category,
  star_reward = excluded.star_reward,
  is_active = true;

${deactivateMissing(
  'daily_task_templates',
  'id',
  DAILY_TASKS.map((task) => task.id),
)}`;
}

export function buildSeedSql(): string {
  const parts = [
    gamesSql(),
    testsSql(),
    questionsSql(),
    testQuestionsSql(),
    measureTestsSql(),
    profileTestsSql(),
    profileTraitsSql(),
    profileQuestionsSql(),
    profileOutcomesSql(),
    badgesSql(),
    tasksSql(),
  ];

  return [
    '-- ÜRETİLEN SQL — elle düzenlemeyin.',
    '-- Kaynak: packages/content · Yeniden üretmek için: scripts/seed-content.sh --sql',
    '',
    'begin;',
    '',
    parts.join('\n\n'),
    '',
    'commit;',
    '',
  ].join('\n');
}

function main(): void {
  const sql = buildSeedSql();

  if (process.argv.includes('--sql')) {
    process.stdout.write(sql);
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl === undefined || databaseUrl.length === 0) {
    console.error('DATABASE_URL gerekli. SQL görmek için: scripts/seed-content.sh --sql');
    process.exit(64);
  }

  // Tek işlem içinde; bir satır patlarsa hiçbiri yazılmıyor.
  execFileSync('psql', [databaseUrl, '-v', 'ON_ERROR_STOP=1', '-q', '-f', '-'], {
    input: sql,
    stdio: ['pipe', 'inherit', 'inherit'],
  });

  const counts = [
    `${GAME_CATALOGUE.length} oyun`,
    `${CONTENT_TESTS.length} test`,
    `${new Set(CONTENT_TESTS.flatMap((test) => test.questions.map((q) => q.id))).size} soru`,
    `1 ölçüm testi`,
    `${PROFILE_TESTS.length} profil testi`,
    `${BADGES.length} rozet`,
    `${DAILY_TASKS.length} görev`,
  ];
  console.error(`Yazıldı: ${counts.join(', ')}.`);
}

main();
