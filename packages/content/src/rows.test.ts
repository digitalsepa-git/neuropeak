import { describe, expect, it } from 'vitest';

import {
  toBadge,
  toDailyTask,
  toGame,
  toMeasureStep,
  toMeasureTest,
  toProfileOutcome,
  toProfileQuestion,
  toProfileTest,
  toProfileTrait,
  toQuestion,
  toQuestionTest,
  type BadgeRow,
  type DailyTaskRow,
  type GameRow,
  type ProfileOutcomeRow,
  type ProfileTestRow,
  type QuestionRow,
  type TestRow,
} from './rows';

/**
 * Panelin canlı yolunda doğrulanabilir olan kısım bu: satırdan
 * içerik tipine çeviri. Sorgunun kendisi çalışan bir Supabase
 * istiyor, çeviri istemiyor.
 */

const GAME: GameRow = {
  id: 'card-match',
  category: 'memory',
  mode: 'levels',
  title_tr: 'Kart Eşleme',
  title_en: 'Card Match',
  description_tr: 'Eşleri bul.',
  description_en: 'Find the pairs.',
  instruction_tr: 'Aynı simgeyi bul',
  instruction_en: 'Find the same symbol',
  skills: [{ tr: 'Görsel hafıza', en: 'Visual memory' }],
  total_levels: 240,
  xp_per_round: 14,
};

describe('toGame', () => {
  it('satırı oyun tipine çevirir', () => {
    expect(toGame(GAME)).toEqual({
      id: 'card-match',
      category: 'memory',
      mode: 'levels',
      title: { tr: 'Kart Eşleme', en: 'Card Match' },
      instruction: { tr: 'Aynı simgeyi bul', en: 'Find the same symbol' },
      description: { tr: 'Eşleri bul.', en: 'Find the pairs.' },
      skills: [{ tr: 'Görsel hafıza', en: 'Visual memory' }],
      baseXp: 14,
      totalLevels: 240,
    });
  });

  it('boş bırakılabilen açıklamayı boş dizgiye çevirir', () => {
    const game = toGame({ ...GAME, description_tr: null, description_en: null });
    expect(game.description).toEqual({ tr: '', en: '' });
  });

  it('bozuk yetenek verisini diziye zorlamıyor', () => {
    // jsonb her şeyi tutabiliyor; dizi değilse boş geçmek, arayüzün
    // `.map` üzerinde patlamasından iyi.
    expect(toGame({ ...GAME, skills: null }).skills).toEqual([]);
  });
});

const BADGE: BadgeRow = {
  id: 'level-5',
  title_tr: 'İlk Adımlar',
  title_en: 'First Steps',
  description_tr: '5. seviyeye ulaş',
  description_en: 'Reach level 5',
  tier: 1,
  star_reward: 15,
  is_secret: false,
  requirement: { kind: 'level', value: 5 },
};

describe('toBadge', () => {
  it('koşulu olduğu gibi taşır', () => {
    const badge = toBadge(BADGE);
    expect(badge.requirement).toEqual({ kind: 'level', value: 5 });
    expect(badge.tier).toBe(1);
    expect(badge.isSecret).toBe(false);
  });
});

describe('toDailyTask', () => {
  const TASK: DailyTaskRow = {
    id: 'play-2-games',
    title_tr: '2 oyun oyna',
    title_en: 'Play 2 games',
    metric: 'play_games',
    target: 2,
    category: null,
    star_reward: 15,
  };

  it('kategorisiz görevde alanı hiç koymuyor', () => {
    // `category` tipte isteğe bağlı; null yazmak "kategori görevi ama
    // kategorisi yok" gibi görünürdü.
    expect('category' in toDailyTask(TASK)).toBe(false);
  });

  it('kategori görevinde kategoriyi taşıyor', () => {
    expect(toDailyTask({ ...TASK, metric: 'play_category', category: 'memory' }).category).toBe(
      'memory',
    );
  });
});

const QUESTION: QuestionRow = {
  slug: 'bi-ns-3',
  kind: 'number_series',
  prompt_tr: 'Devamı?',
  prompt_en: 'What comes next?',
  options: [{ tr: '8', en: '8' }],
  correct_index: 0,
  difficulty_weight: 1.2,
  explanation_tr: null,
  explanation_en: null,
  visual: null,
};

describe('toQuestion', () => {
  it('kimlik olarak içerikteki kalıcı kimliği kullanıyor', () => {
    expect(toQuestion(QUESTION).id).toBe('bi-ns-3');
  });

  it('açıklaması olmayan soruda alan hiç yok', () => {
    expect('explanation' in toQuestion(QUESTION)).toBe(false);
  });

  it('açıklama varsa iki dilde taşınıyor', () => {
    const q = toQuestion({ ...QUESTION, explanation_tr: 'Çünkü', explanation_en: 'Because' });
    expect(q.explanation).toEqual({ tr: 'Çünkü', en: 'Because' });
  });

  it('görsel şeması olmayan soruda alan hiç yok', () => {
    expect('visual' in toQuestion(QUESTION)).toBe(false);
  });
});

describe('toQuestionTest', () => {
  const TEST: TestRow = {
    id: 'basic-iq',
    kind: 'iq',
    title_tr: 'Temel IQ',
    title_en: 'Basic IQ',
    description_tr: null,
    description_en: null,
    question_count: 20,
    est_minutes_min: 8,
    est_minutes_max: 12,
    is_pro: false,
    focus: null,
    norm_mean: 100,
    norm_sd: 15,
  };

  it('alanı olmayan testte `focus` hiç yok', () => {
    // Genel test ile tek alanı ölçen test arayüzde farklı görünüyor.
    expect('focus' in toQuestionTest(TEST, [])).toBe(false);
  });

  it('alanı olan testte taşınıyor', () => {
    expect(toQuestionTest({ ...TEST, focus: 'verbal' }, []).focus).toBe('verbal');
  });

  it('soruları verildiği sırayla taşıyor', () => {
    const test = toQuestionTest(TEST, [toQuestion(QUESTION)]);
    expect(test.questions.map((q) => q.id)).toEqual(['bi-ns-3']);
    expect(test.norm).toEqual({ mean: 100, sd: 15 });
  });
});

describe('toMeasureTest', () => {
  it('uyarı metnini ve adımları taşıyor', () => {
    const test = toMeasureTest(
      {
        id: 'brain-age',
        title_tr: 'Beyin Yaşı',
        title_en: 'Brain Age',
        description_tr: null,
        description_en: null,
        caveat_tr: 'Ölçüm değil.',
        caveat_en: 'Not a measurement.',
        est_minutes_min: 3,
        est_minutes_max: 5,
        is_pro: true,
      },
      [
        toMeasureStep({
          measure: 'reaction',
          title_tr: 'Tepki',
          title_en: 'Reaction',
          instruction_tr: 'Dokun',
          instruction_en: 'Tap',
          seconds: 30,
        }),
      ],
    );

    expect(test.caveat).toEqual({ tr: 'Ölçüm değil.', en: 'Not a measurement.' });
    expect(test.steps).toHaveLength(1);
    expect(test.steps[0]?.seconds).toBe(30);
    expect(test.estMinutes).toEqual([3, 5]);
  });
});

describe('toProfileTest', () => {
  const ROW: ProfileTestRow = {
    id: 'archetype',
    title_tr: 'Zihin Arketipin',
    title_en: 'Your Mind Archetype',
    description_tr: null,
    description_en: null,
    caveat_tr: 'Envanter değil.',
    caveat_en: 'Not an inventory.',
    est_minutes_min: 2,
    est_minutes_max: 3,
    is_pro: true,
  };

  const ARCHITECT: ProfileOutcomeRow = {
    id: 'architect',
    title_tr: 'Mimar',
    title_en: 'Architect',
    description_tr: 'Yapı kurar.',
    description_en: 'Builds structure.',
    traits: ['analytic', 'methodical'],
    is_balanced: false,
  };

  const BALANCED: ProfileOutcomeRow = {
    ...ARCHITECT,
    id: 'balanced',
    traits: [],
    is_balanced: true,
  };

  const TRAIT = toProfileTrait({
    id: 'analytic',
    label_tr: 'Çözümleyici',
    label_en: 'Analytic',
    description_tr: 'Parçalara ayırır.',
    description_en: 'Breaks it down.',
  });

  const QUESTION_ROW = toProfileQuestion({
    slug: 'ar-1',
    prompt_tr: 'Soru',
    prompt_en: 'Question',
    options: [{ label: { tr: 'A', en: 'A' }, weights: { analytic: 2 } }],
  });

  it('dengeli sonucu arketiplerden ayırıyor', () => {
    // İçerikte `balanced` `outcomes` dizisinin dışında: sıralamaya
    // girmiyor. Veritabanında ikisi aynı tabloda.
    const test = toProfileTest(ROW, [TRAIT], [QUESTION_ROW], [ARCHITECT, BALANCED]);

    expect(test.outcomes?.map((o) => o.id)).toEqual(['architect']);
    expect(test.balanced?.id).toBe('balanced');
  });

  it('arketipsiz testte `outcomes` hiç yok', () => {
    // Boş dizi ile tanımsız arayüzde farklı: arketip mi, eksen
    // haritası mı.
    const test = toProfileTest(ROW, [TRAIT], [QUESTION_ROW], []);

    expect('outcomes' in test).toBe(false);
    expect('balanced' in test).toBe(false);
  });

  it('eksen puanlarını olduğu gibi taşıyor', () => {
    const test = toProfileTest(ROW, [TRAIT], [QUESTION_ROW], [ARCHITECT]);
    expect(test.questions[0]?.options[0]?.weights).toEqual({ analytic: 2 });
  });

  it('uyarı metnini taşıyor', () => {
    expect(toProfileTest(ROW, [], [], []).caveat.tr).toBe('Envanter değil.');
  });
});

describe('toProfileOutcome', () => {
  it('bozuk eksen listesini diziye zorlamıyor', () => {
    const outcome = toProfileOutcome({
      id: 'x',
      title_tr: 'X',
      title_en: 'X',
      description_tr: 'X',
      description_en: 'X',
      traits: null,
      is_balanced: false,
    });

    expect(outcome.traits).toEqual([]);
  });
});
