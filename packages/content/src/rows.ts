import type { BadgeRequirement } from '@neuropeak/core';

import type { ContentBadge } from './badges/catalogue';
import type { ContentGame } from './games/catalogue';
import type { ContentDailyTask } from './tasks/catalogue';
import type { BrainAgeStep } from './tests/brain-age';
import type {
  ProfileAnswer,
  ProfileOutcome,
  ProfileQuestion,
  ProfileTest,
  ProfileTrait,
} from './tests/profiles';
import type { ContentQuestion, ContentTest, Localized } from './types';

/**
 * Veritabanı satırlarını içerik tiplerine çevirir.
 *
 * Panel iki kaynaktan okuyabiliyor: Supabase bağlıysa veritabanından,
 * değilse uygulamaya gömülü banka. Sayfaların iki kaynağı ayırt
 * etmesi gerekmesin diye canlı satırlar da aynı içerik tiplerine
 * çevriliyor; ayrım tek yerde, burada.
 *
 * Çeviriler saf: ağ çağrısı yok, bu yüzden testlenebilirler. Panelin
 * canlı yolunda doğrulanabilir olan kısım bu — sorgunun kendisi
 * çalışan bir Supabase ister.
 *
 * Çeviriler içerik paketinde çünkü iki taraf da aynısını istiyor:
 * yönetim paneli okuduğunu göstermek için, mobil uygulama da
 * içeriği veritabanından çekmek için. Aynı mantığı iki yerde
 * tutmak, birini düzeltip diğerini unutmak demekti.
 *
 * Satır şekilleri burada dar biçimde yazılı. Üretilen tam tip
 * `apps/mobile/src/lib/database.types.ts`'te duruyor ama o mobil
 * uygulamanın içinde. Şema ile içerik arasındaki denklik
 * `npm run db:verify` ile her CI koşusunda sınanıyor.
 */

/**
 * Sorgularda okunan sütunlar.
 *
 * Burada duruyorlar çünkü çevirinin beklediği alanlarla birebir
 * eşleşmeleri gerekiyor; bir sütun eklenip listeye yazılmazsa
 * çeviri sessizce `undefined` okur.
 */
export const GAME_COLUMNS =
  'id, category, mode, title_tr, title_en, description_tr, description_en, ' +
  'instruction_tr, instruction_en, skills, total_levels, xp_per_round';

export const BADGE_COLUMNS =
  'id, title_tr, title_en, description_tr, description_en, tier, star_reward, ' +
  'is_secret, requirement';

export const TASK_COLUMNS = 'id, title_tr, title_en, metric, target, category, star_reward';

export const TEST_COLUMNS =
  'id, kind, title_tr, title_en, description_tr, description_en, question_count, ' +
  'est_minutes_min, est_minutes_max, is_pro, focus, norm_mean, norm_sd';

export const QUESTION_COLUMNS =
  'slug, kind, prompt_tr, prompt_en, options, correct_index, difficulty_weight, ' +
  'explanation_tr, explanation_en, visual';

export const MEASURE_TEST_COLUMNS =
  'id, title_tr, title_en, description_tr, description_en, caveat_tr, caveat_en, ' +
  'est_minutes_min, est_minutes_max, is_pro, ' +
  'measure_steps(measure, title_tr, title_en, instruction_tr, instruction_en, seconds, sort_order)';

export const PROFILE_TEST_COLUMNS =
  'id, title_tr, title_en, description_tr, description_en, caveat_tr, caveat_en, ' +
  'est_minutes_min, est_minutes_max, is_pro, ' +
  'profile_traits(id, label_tr, label_en, description_tr, description_en, sort_order), ' +
  'profile_questions(slug, prompt_tr, prompt_en, options, sort_order), ' +
  'profile_outcomes(id, title_tr, title_en, description_tr, description_en, traits, is_balanced, sort_order)';

type Json = unknown;

function localized(tr: string, en: string): Localized {
  return { tr, en };
}

/** Boş bırakılabilen metin sütunları; arayüz boş dizgiyle çalışıyor. */
function orEmpty(value: string | null): string {
  return value ?? '';
}

// ---------------------------------------------------------------- oyunlar

export type GameRow = {
  readonly id: string;
  readonly category: ContentGame['category'];
  readonly mode: ContentGame['mode'];
  readonly title_tr: string;
  readonly title_en: string;
  readonly description_tr: string | null;
  readonly description_en: string | null;
  readonly instruction_tr: string;
  readonly instruction_en: string;
  readonly skills: Json;
  readonly total_levels: number;
  readonly xp_per_round: number;
};

export function toGame(row: GameRow): ContentGame {
  return {
    id: row.id,
    category: row.category,
    mode: row.mode,
    title: localized(row.title_tr, row.title_en),
    instruction: localized(row.instruction_tr, row.instruction_en),
    description: localized(orEmpty(row.description_tr), orEmpty(row.description_en)),
    // Yetenekler jsonb dizisi; veritabanı içeriğini yorumlamıyor.
    skills: Array.isArray(row.skills) ? (row.skills as readonly Localized[]) : [],
    baseXp: row.xp_per_round,
    totalLevels: row.total_levels,
  };
}

// ---------------------------------------------------------------- rozetler

export type BadgeRow = {
  readonly id: string;
  readonly title_tr: string;
  readonly title_en: string;
  readonly description_tr: string | null;
  readonly description_en: string | null;
  readonly tier: number;
  readonly star_reward: number;
  readonly is_secret: boolean;
  readonly requirement: Json;
};

export function toBadge(row: BadgeRow): ContentBadge {
  return {
    id: row.id,
    // Kademe veritabanında smallint; tip 1–4 bekliyor ve kısıt da
    // bunu zorluyor (`tier between 1 and 4`).
    tier: row.tier as ContentBadge['tier'],
    starReward: row.star_reward,
    isSecret: row.is_secret,
    // Koşulu çekirdek yorumluyor; veritabanı taşıyor.
    requirement: row.requirement as BadgeRequirement,
    title: localized(row.title_tr, row.title_en),
    description: localized(orEmpty(row.description_tr), orEmpty(row.description_en)),
  };
}

// ---------------------------------------------------------------- görevler

export type DailyTaskRow = {
  readonly id: string;
  readonly title_tr: string;
  readonly title_en: string;
  readonly metric: string;
  readonly target: number;
  readonly category: ContentDailyTask['category'] | null;
  readonly star_reward: number;
};

export function toDailyTask(row: DailyTaskRow): ContentDailyTask {
  const base = {
    id: row.id,
    metric: row.metric as ContentDailyTask['metric'],
    target: row.target,
    starReward: row.star_reward,
    title: localized(row.title_tr, row.title_en),
  };

  // `category` yalnızca kategori görevlerinde dolu; tipte isteğe
  // bağlı olduğu için null'u alana yazmak yerine atlıyoruz.
  return row.category === null ? base : { ...base, category: row.category };
}

// ---------------------------------------------------------------- sorular

export type QuestionRow = {
  readonly slug: string | null;
  readonly kind: ContentQuestion['kind'];
  readonly prompt_tr: string;
  readonly prompt_en: string;
  readonly options: Json;
  readonly correct_index: number;
  readonly difficulty_weight: number;
  readonly explanation_tr: string | null;
  readonly explanation_en: string | null;
  readonly visual: Json;
};

export function toQuestion(row: QuestionRow): ContentQuestion {
  const base: ContentQuestion = {
    // Kimlik içerikteki kalıcı kimlik; uuid birincil anahtar panelde
    // bir şey ifade etmiyor.
    id: row.slug ?? '',
    kind: row.kind,
    prompt: localized(row.prompt_tr, row.prompt_en),
    options: Array.isArray(row.options) ? (row.options as readonly Localized[]) : [],
    correctIndex: row.correct_index,
    difficultyWeight: row.difficulty_weight,
  };

  const explanation =
    row.explanation_tr === null && row.explanation_en === null
      ? undefined
      : localized(orEmpty(row.explanation_tr), orEmpty(row.explanation_en));

  return {
    ...base,
    ...(explanation === undefined ? {} : { explanation }),
    ...(row.visual === null ? {} : { visual: row.visual as ContentQuestion['visual'] }),
  };
}

// ---------------------------------------------------------------- testler

export type TestRow = {
  readonly id: string;
  readonly kind: ContentTest['kind'];
  readonly title_tr: string;
  readonly title_en: string;
  readonly description_tr: string | null;
  readonly description_en: string | null;
  readonly question_count: number;
  readonly est_minutes_min: number;
  readonly est_minutes_max: number;
  readonly is_pro: boolean;
  readonly focus: ContentTest['focus'] | null;
  readonly norm_mean: number;
  readonly norm_sd: number;
};

export function toQuestionTest(row: TestRow, questions: readonly ContentQuestion[]): ContentTest {
  const base = {
    id: row.id,
    kind: row.kind,
    title: localized(row.title_tr, row.title_en),
    description: localized(orEmpty(row.description_tr), orEmpty(row.description_en)),
    questionCount: row.question_count,
    estMinutes: [row.est_minutes_min, row.est_minutes_max] as const,
    isPro: row.is_pro,
    norm: { mean: row.norm_mean, sd: row.norm_sd },
    questions,
  };

  return row.focus === null ? base : { ...base, focus: row.focus };
}

// ---------------------------------------------------------------- ölçüm testi

export type MeasureTestRow = {
  readonly id: string;
  readonly title_tr: string;
  readonly title_en: string;
  readonly description_tr: string | null;
  readonly description_en: string | null;
  readonly caveat_tr: string;
  readonly caveat_en: string;
  readonly est_minutes_min: number;
  readonly est_minutes_max: number;
  readonly is_pro: boolean;
};

export type MeasureStepRow = {
  readonly measure: BrainAgeStep['measure'];
  readonly title_tr: string;
  readonly title_en: string;
  readonly instruction_tr: string;
  readonly instruction_en: string;
  readonly seconds: number;
};

export type MeasureTest = {
  readonly id: string;
  readonly title: Localized;
  readonly description: Localized;
  readonly caveat: Localized;
  readonly estMinutes: readonly [number, number];
  readonly isPro: boolean;
  readonly steps: readonly BrainAgeStep[];
};

export function toMeasureStep(row: MeasureStepRow): BrainAgeStep {
  return {
    measure: row.measure,
    title: localized(row.title_tr, row.title_en),
    instruction: localized(row.instruction_tr, row.instruction_en),
    seconds: row.seconds,
  };
}

export function toMeasureTest(row: MeasureTestRow, steps: readonly BrainAgeStep[]): MeasureTest {
  return {
    id: row.id,
    title: localized(row.title_tr, row.title_en),
    description: localized(orEmpty(row.description_tr), orEmpty(row.description_en)),
    caveat: localized(row.caveat_tr, row.caveat_en),
    estMinutes: [row.est_minutes_min, row.est_minutes_max],
    isPro: row.is_pro,
    steps,
  };
}

// ---------------------------------------------------------------- profil testleri

export type ProfileTestRow = {
  readonly id: string;
  readonly title_tr: string;
  readonly title_en: string;
  readonly description_tr: string | null;
  readonly description_en: string | null;
  readonly caveat_tr: string;
  readonly caveat_en: string;
  readonly est_minutes_min: number;
  readonly est_minutes_max: number;
  readonly is_pro: boolean;
};

export type ProfileTraitRow = {
  readonly id: string;
  readonly label_tr: string;
  readonly label_en: string;
  readonly description_tr: string;
  readonly description_en: string;
};

export type ProfileQuestionRow = {
  readonly slug: string;
  readonly prompt_tr: string;
  readonly prompt_en: string;
  readonly options: Json;
};

export type ProfileOutcomeRow = {
  readonly id: string;
  readonly title_tr: string;
  readonly title_en: string;
  readonly description_tr: string;
  readonly description_en: string;
  readonly traits: Json;
  readonly is_balanced: boolean;
};

export function toProfileTrait(row: ProfileTraitRow): ProfileTrait {
  return {
    id: row.id,
    label: localized(row.label_tr, row.label_en),
    description: localized(row.description_tr, row.description_en),
  };
}

export function toProfileQuestion(row: ProfileQuestionRow): ProfileQuestion {
  return {
    id: row.slug,
    prompt: localized(row.prompt_tr, row.prompt_en),
    options: Array.isArray(row.options) ? (row.options as readonly ProfileAnswer[]) : [],
  };
}

export function toProfileOutcome(row: ProfileOutcomeRow): ProfileOutcome {
  return {
    id: row.id,
    traits: Array.isArray(row.traits) ? (row.traits as readonly string[]) : [],
    title: localized(row.title_tr, row.title_en),
    description: localized(row.description_tr, row.description_en),
  };
}

/**
 * Profil testi.
 *
 * İçerikte `balanced` sonucu `outcomes` dizisinin dışında duruyor —
 * sıralamaya girmiyor, hiçbir eksen öne çıkmadığında gösteriliyor.
 * Veritabanında ikisi aynı tabloda, `is_balanced` bayrağıyla; burada
 * yeniden ayrılıyorlar.
 *
 * `outcomes` yalnızca arketipli testlerde dolu: boş bir dizi ile
 * tanımsız arasındaki fark arayüzde görünüyor (arketip mi, eksen
 * haritası mı), bu yüzden boşsa alan hiç konmuyor.
 */
export function toProfileTest(
  row: ProfileTestRow,
  traits: readonly ProfileTrait[],
  questions: readonly ProfileQuestion[],
  outcomeRows: readonly ProfileOutcomeRow[],
): ProfileTest {
  const outcomes = outcomeRows.filter((o) => !o.is_balanced).map(toProfileOutcome);
  const balancedRow = outcomeRows.find((o) => o.is_balanced);

  return {
    id: row.id,
    title: localized(row.title_tr, row.title_en),
    description: localized(orEmpty(row.description_tr), orEmpty(row.description_en)),
    caveat: localized(row.caveat_tr, row.caveat_en),
    estMinutes: [row.est_minutes_min, row.est_minutes_max],
    isPro: row.is_pro,
    traits,
    questions,
    ...(outcomes.length === 0 ? {} : { outcomes }),
    ...(balancedRow === undefined ? {} : { balanced: toProfileOutcome(balancedRow) }),
  };
}
