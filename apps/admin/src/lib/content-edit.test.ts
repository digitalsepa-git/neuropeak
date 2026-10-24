import { describe, expect, it } from 'vitest';

import { PUSH_BODY_MAX, PUSH_TITLE_MAX } from '@neuropeak/core';

import {
  parseBadge,
  parseCampaign,
  parseDailyTask,
  parseGame,
  parseQuestion,
  parseTest,
} from './content-edit';

/**
 * Doğrulama saf olduğu için testlenebilen tek yazma parçası bu.
 * Veritabanına yazmanın kendisi çalışan bir Supabase istiyor.
 */

const TASK = {
  id: 'play-2-games',
  title_tr: '2 oyun oyna',
  title_en: 'Play 2 games',
  target: '2',
  star_reward: '15',
  category: '',
};

describe('parseDailyTask', () => {
  it('geçerli formu okur', () => {
    const parsed = parseDailyTask(TASK);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value).toEqual({
      id: 'play-2-games',
      title_tr: '2 oyun oyna',
      title_en: 'Play 2 games',
      target: 2,
      star_reward: 15,
      category: null,
    });
  });

  it('boş başlığı reddeder', () => {
    const parsed = parseDailyTask({ ...TASK, title_tr: '   ' });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('Türkçe başlık');
  });

  it('hedefi sıfır ya da altına indirmiyor', () => {
    // Veritabanı kısıtı da bunu tutuyor (`target > 0`); buradaki
    // kontrol hatayı kullanıcıya anlatmak için.
    const parsed = parseDailyTask({ ...TASK, target: '0' });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('en az 1');
  });

  it('ondalık hedefi reddeder', () => {
    const parsed = parseDailyTask({ ...TASK, target: '2.5' });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('tam sayı');
  });

  it('negatif yıldızı reddeder', () => {
    const parsed = parseDailyTask({ ...TASK, star_reward: '-1' });
    expect(parsed.ok).toBe(false);
  });

  it('metin yazılmış sayıyı reddeder', () => {
    const parsed = parseDailyTask({ ...TASK, star_reward: 'çok' });
    expect(parsed.ok).toBe(false);
  });

  it('tanınmayan kategoriyi reddeder', () => {
    const parsed = parseDailyTask({ ...TASK, category: 'uydurma' });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('Kategori');
  });

  it('geçerli kategoriyi taşır', () => {
    const parsed = parseDailyTask({ ...TASK, category: 'memory' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.category).toBe('memory');
  });

  it('başlıkların başındaki ve sonundaki boşluğu atar', () => {
    const parsed = parseDailyTask({ ...TASK, title_tr: '  2 oyun oyna  ' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.title_tr).toBe('2 oyun oyna');
  });
});

const BADGE = {
  id: 'level-5',
  title_tr: 'İlk Adımlar',
  title_en: 'First Steps',
  description_tr: '5. seviyeye ulaş',
  description_en: 'Reach level 5',
  star_reward: '15',
};

describe('parseBadge', () => {
  it('geçerli formu okur', () => {
    const parsed = parseBadge(BADGE);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.star_reward).toBe(15);
    expect(parsed.value.is_secret).toBe(false);
  });

  it('işaretli onay kutusunu gizli olarak okur', () => {
    const parsed = parseBadge({ ...BADGE, is_secret: 'on' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.is_secret).toBe(true);
  });

  it('koşulu hiç okumuyor', () => {
    // Form koşulu göndermiyor; gönderse bile buradan geçmemeli.
    const parsed = parseBadge({ ...BADGE, requirement: '{"kind":"level","value":99}' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect('requirement' in parsed.value).toBe(false);
  });

  it('boş adı reddeder', () => {
    expect(parseBadge({ ...BADGE, title_en: '' }).ok).toBe(false);
  });

  it('açıklama boş kalabilir', () => {
    const parsed = parseBadge({ ...BADGE, description_tr: '', description_en: '' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.description_tr).toBe('');
  });
});

const QUESTION = {
  slug: 'bi-ns-3',
  prompt_tr: 'Devamı hangisi?',
  prompt_en: 'What comes next?',
  options_count: '3',
  option_tr_0: '8',
  option_en_0: '8',
  option_tr_1: '9',
  option_en_1: '9',
  option_tr_2: '10',
  option_en_2: '10',
  correct_index: '1',
  difficulty_weight: '1.2',
  explanation_tr: '',
  explanation_en: '',
};

describe('parseQuestion', () => {
  it('geçerli formu okur', () => {
    const parsed = parseQuestion(QUESTION);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.options).toEqual([
      { tr: '8', en: '8' },
      { tr: '9', en: '9' },
      { tr: '10', en: '10' },
    ]);
    expect(parsed.value.correct_index).toBe(1);
    expect(parsed.value.difficulty_weight).toBe(1.2);
  });

  it('iki şıktan az soruyu reddeder', () => {
    // Veritabanı kısıtı da tutuyor; mesaj burada kuruluyor.
    const parsed = parseQuestion({ ...QUESTION, options_count: '1' });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('en az iki şık');
  });

  it('aralık dışı doğru şıkkı reddeder', () => {
    const parsed = parseQuestion({ ...QUESTION, correct_index: '3' });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('şıklardan biri');
  });

  it('negatif doğru şıkkı reddeder', () => {
    expect(parseQuestion({ ...QUESTION, correct_index: '-1' }).ok).toBe(false);
  });

  it('şık silindikten sonra tutarlı kalıyor', () => {
    // Form şıkları sıfırdan sıkışık gönderiyor: üçüncü şık silinince
    // sayı ikiye iniyor ve doğru şık hâlâ aralıkta.
    const parsed = parseQuestion({ ...QUESTION, options_count: '2', correct_index: '1' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.options).toHaveLength(2);
  });

  it('silinen şık doğru şıksa yakalanıyor', () => {
    const parsed = parseQuestion({ ...QUESTION, options_count: '2', correct_index: '2' });
    expect(parsed.ok).toBe(false);
  });

  it('yarım kalan şıkkı reddeder', () => {
    const parsed = parseQuestion({ ...QUESTION, option_en_1: '' });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('2. şık');
  });

  it('sıfır ya da negatif ağırlığı reddeder', () => {
    expect(parseQuestion({ ...QUESTION, difficulty_weight: '0' }).ok).toBe(false);
    expect(parseQuestion({ ...QUESTION, difficulty_weight: '-1' }).ok).toBe(false);
  });

  it('virgüllü ondalığı okuyor', () => {
    // Türkçe klavyede ondalık ayırıcı virgül; "1,2" yazan biri
    // "sayı olmalı" hatası almasın.
    const parsed = parseQuestion({ ...QUESTION, difficulty_weight: '1,4' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.difficulty_weight).toBe(1.4);
  });

  it('boş soru metnini reddeder', () => {
    expect(parseQuestion({ ...QUESTION, prompt_tr: '  ' }).ok).toBe(false);
  });

  it('boş açıklamayı null yapıyor', () => {
    const parsed = parseQuestion(QUESTION);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.explanation_tr).toBeNull();
  });

  it('dolu açıklamayı taşıyor', () => {
    const parsed = parseQuestion({ ...QUESTION, explanation_tr: 'Çünkü ikişer artıyor.' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.explanation_tr).toBe('Çünkü ikişer artıyor.');
  });

  it('görsel şemayı hiç okumuyor', () => {
    // Şekil şeması elle yazılacak bir şey değil; form göndermiyor,
    // gönderse de buradan geçmemeli.
    const parsed = parseQuestion({ ...QUESTION, visual: '{"layout":"grid"}' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect('visual' in parsed.value).toBe(false);
  });
});

const GAME = {
  id: 'card-match',
  title_tr: 'Kart Eşleme',
  title_en: 'Card Match',
  description_tr: 'Eşleri bul.',
  description_en: 'Find the pairs.',
  instruction_tr: 'Aynı simgeyi bul',
  instruction_en: 'Find the same symbol',
  skills_count: '2',
  skill_tr_0: 'Görsel hafıza',
  skill_en_0: 'Visual memory',
  skill_tr_1: 'Dikkat',
  skill_en_1: 'Attention',
  xp_per_round: '14',
  total_levels: '240',
};

describe('parseGame', () => {
  it('seviyeli oyunu okur', () => {
    const parsed = parseGame(GAME, 'levels');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.skills).toHaveLength(2);
    expect(parsed.value.total_levels).toBe(240);
    expect(parsed.value.xp_per_round).toBe(14);
  });

  it('süreli oyunda seviye sayısı sıfır olmalı', () => {
    // Veritabanı kısıtı da tutuyor (`games_mode_levels_agree`).
    const parsed = parseGame(GAME, 'timed');
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('0 olmalı');
  });

  it('seviyeli oyun sıfır seviyeyle kalamaz', () => {
    const parsed = parseGame({ ...GAME, total_levels: '0' }, 'levels');
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('en az bir seviye');
  });

  it('süreli oyunu sıfır seviyeyle kabul eder', () => {
    expect(parseGame({ ...GAME, total_levels: '0' }, 'timed').ok).toBe(true);
  });

  it('yarım kalan yeteneği reddeder', () => {
    const parsed = parseGame({ ...GAME, skill_en_1: '' }, 'levels');
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('2. yetenek');
  });

  it('yeteneksiz oyunu kabul eder', () => {
    const parsed = parseGame({ ...GAME, skills_count: '0' }, 'levels');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.skills).toEqual([]);
  });

  it('sıfır XP reddediliyor', () => {
    expect(parseGame({ ...GAME, xp_per_round: '0' }, 'levels').ok).toBe(false);
  });

  it('boş yönergeyi reddeder', () => {
    expect(parseGame({ ...GAME, instruction_tr: '' }, 'levels').ok).toBe(false);
  });
});

const TEST_HEADER = {
  id: 'basic-iq',
  title_tr: 'Temel IQ Testi',
  title_en: 'Basic IQ Test',
  description_tr: 'Genel değerlendirme.',
  description_en: 'A general assessment.',
  question_count: '20',
  est_minutes_min: '8',
  est_minutes_max: '12',
};

describe('parseTest', () => {
  it('geçerli üst bilgiyi okur', () => {
    const parsed = parseTest(TEST_HEADER, 30);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.question_count).toBe(20);
    expect(parsed.value.is_pro).toBe(false);
  });

  it('havuzdan fazla soru sorulamaz', () => {
    // Bu kontrolün veritabanında karşılığı yok: havuz başka bir
    // tabloda ve kısıtla ifade edilemiyor.
    const parsed = parseTest({ ...TEST_HEADER, question_count: '40' }, 30);
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('30 soru var');
  });

  it('havuza eşit sayıyı kabul eder', () => {
    expect(parseTest({ ...TEST_HEADER, question_count: '30' }, 30).ok).toBe(true);
  });

  it('sıfır soruyu reddeder', () => {
    expect(parseTest({ ...TEST_HEADER, question_count: '0' }, 30).ok).toBe(false);
  });

  it('ters süre aralığını reddeder', () => {
    const parsed = parseTest({ ...TEST_HEADER, est_minutes_min: '12', est_minutes_max: '8' }, 30);
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('en az süreden küçük');
  });

  it('eşit süre aralığını kabul eder', () => {
    expect(parseTest({ ...TEST_HEADER, est_minutes_min: '10', est_minutes_max: '10' }, 30).ok).toBe(
      true,
    );
  });

  it('normu hiç okumuyor', () => {
    // Ham puanı IQ'ya çeviren ölçek metin değil; panelden
    // değiştirilmiyor.
    const parsed = parseTest({ ...TEST_HEADER, norm_mean: '120' }, 30);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect('norm_mean' in parsed.value).toBe(false);
  });
});

const CAMPAIGN = {
  segment_id: 'streak-holders',
  title_tr: 'Serini koru',
  body_tr: 'Bugün bir tur oyna, serin devam etsin.',
  title_en: 'Keep your streak',
  body_en: 'Play one round today to keep it going.',
  local_hour: '19',
};

describe('parseCampaign', () => {
  it('geçerli formu okur', () => {
    const parsed = parseCampaign(CAMPAIGN);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.segment_id).toBe('streak-holders');
    expect(parsed.value.local_hour).toBe(19);
  });

  it('kitlesiz kampanyayı kabul eder', () => {
    // Kitle boşsa kampanya herkese; "hiç kimse" demek değil.
    const parsed = parseCampaign({ ...CAMPAIGN, segment_id: '' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.segment_id).toBeNull();
  });

  it('boş saati sıfır saymaz', () => {
    // Gece yarısı geçerli bir saat; "saat seçilmedi" ondan ayrı.
    const parsed = parseCampaign({ ...CAMPAIGN, local_hour: '' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.local_hour).toBeNull();
  });

  it('gece yarısını saat olarak kabul eder', () => {
    const parsed = parseCampaign({ ...CAMPAIGN, local_hour: '0' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.local_hour).toBe(0);
  });

  it('aralık dışı saati reddeder', () => {
    expect(parseCampaign({ ...CAMPAIGN, local_hour: '24' }).ok).toBe(false);
  });

  it('çekirdekteki başlık sınırını uygular', () => {
    // Besteci kutusu da aynı sayıyı sayıyor; sunucu daha gevşek
    // olsaydı kilit ekranında kırpılan metin kaydedilirdi.
    const parsed = parseCampaign({ ...CAMPAIGN, title_tr: 'a'.repeat(PUSH_TITLE_MAX + 1) });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain(`${PUSH_TITLE_MAX}`);
  });

  it('sınıra eşit metni kabul eder', () => {
    expect(parseCampaign({ ...CAMPAIGN, body_en: 'a'.repeat(PUSH_BODY_MAX) }).ok).toBe(true);
  });

  it('boş metni reddeder', () => {
    expect(parseCampaign({ ...CAMPAIGN, body_tr: '   ' }).ok).toBe(false);
  });
});
