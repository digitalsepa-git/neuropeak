import { GAME_CATEGORIES, type GameCategory } from '@neuropeak/core';

/**
 * Düzenleme formlarının doğrulaması.
 *
 * Saf: `FormData` değil düz bir kayıt alıyor, böylece testlenebiliyor.
 * Sunucu eylemi formu kayda çevirip buraya veriyor.
 *
 * Kontroller veritabanındaki kısıtların aynısı (`star_reward >= 0`,
 * `target > 0`). İkisi de gerekli: kısıt son söz ama hatayı
 * kullanıcıya anlatan cümle burada kuruluyor; sadece kısıta
 * güvenseydik panelde "bir şeyler ters gitti" yazardı.
 */

export type Parsed<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly message: string };

export type FormValues = Readonly<Record<string, string>>;

function text(values: FormValues, key: string): string {
  return (values[key] ?? '').trim();
}

function required(values: FormValues, key: string, label: string): Parsed<string> {
  const value = text(values, key);
  return value.length === 0 ? { ok: false, message: `${label} boş olamaz.` } : { ok: true, value };
}

/** Tam sayı; ondalık ya da metin girilirse hata. */
function integer(values: FormValues, key: string, label: string): Parsed<number> {
  const raw = text(values, key);
  if (raw.length === 0) return { ok: false, message: `${label} boş olamaz.` };

  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) return { ok: false, message: `${label} tam sayı olmalı.` };

  return { ok: true, value: parsed };
}

// ---------------------------------------------------------------- görevler

export type DailyTaskEdit = {
  readonly id: string;
  readonly title_tr: string;
  readonly title_en: string;
  readonly target: number;
  readonly star_reward: number;
  readonly category: GameCategory | null;
};

export function parseDailyTask(values: FormValues): Parsed<DailyTaskEdit> {
  const id = required(values, 'id', 'Kimlik');
  if (!id.ok) return id;

  const titleTr = required(values, 'title_tr', 'Türkçe başlık');
  if (!titleTr.ok) return titleTr;

  const titleEn = required(values, 'title_en', 'İngilizce başlık');
  if (!titleEn.ok) return titleEn;

  const target = integer(values, 'target', 'Hedef');
  if (!target.ok) return target;
  if (target.value < 1) return { ok: false, message: 'Hedef en az 1 olmalı.' };

  const stars = integer(values, 'star_reward', 'Yıldız ödülü');
  if (!stars.ok) return stars;
  if (stars.value < 0) return { ok: false, message: 'Yıldız ödülü negatif olamaz.' };

  const rawCategory = text(values, 'category');
  if (rawCategory.length > 0 && !isCategory(rawCategory)) {
    return { ok: false, message: 'Kategori tanınmadı.' };
  }

  return {
    ok: true,
    value: {
      id: id.value,
      title_tr: titleTr.value,
      title_en: titleEn.value,
      target: target.value,
      star_reward: stars.value,
      category: rawCategory.length === 0 ? null : (rawCategory as GameCategory),
    },
  };
}

function isCategory(value: string): value is GameCategory {
  return (GAME_CATEGORIES as readonly string[]).includes(value);
}

// ---------------------------------------------------------------- rozetler

export type BadgeEdit = {
  readonly id: string;
  readonly title_tr: string;
  readonly title_en: string;
  readonly description_tr: string;
  readonly description_en: string;
  readonly star_reward: number;
  readonly is_secret: boolean;
};

/**
 * Rozetin metinleri ve ödülü.
 *
 * Koşul (`requirement`) buraya dâhil değil ve form onu salt okunur
 * gösteriyor: koşulu daraltmak, rozeti çoktan kazanmış kullanıcıları
 * artık hak etmedikleri bir rozetle bırakıyor — motor kazanılmış
 * rozeti geri almıyor. Bunu panelden tek tıkla yapılabilir kılmak,
 * geri alınamayan bir kararı kazara verdirmek olurdu.
 */
export function parseBadge(values: FormValues): Parsed<BadgeEdit> {
  const id = required(values, 'id', 'Kimlik');
  if (!id.ok) return id;

  const titleTr = required(values, 'title_tr', 'Türkçe ad');
  if (!titleTr.ok) return titleTr;

  const titleEn = required(values, 'title_en', 'İngilizce ad');
  if (!titleEn.ok) return titleEn;

  const stars = integer(values, 'star_reward', 'Yıldız ödülü');
  if (!stars.ok) return stars;
  if (stars.value < 0) return { ok: false, message: 'Yıldız ödülü negatif olamaz.' };

  return {
    ok: true,
    value: {
      id: id.value,
      title_tr: titleTr.value,
      title_en: titleEn.value,
      description_tr: text(values, 'description_tr'),
      description_en: text(values, 'description_en'),
      star_reward: stars.value,
      // Onay kutusu işaretli değilse alan forma hiç gelmiyor.
      is_secret: text(values, 'is_secret') === 'on',
    },
  };
}

// ---------------------------------------------------------------- sorular

/** Ondalık sayı; zorluk ağırlığı 0,7–2 aralığında dolaşıyor. */
function decimal(values: FormValues, key: string, label: string): Parsed<number> {
  const raw = text(values, key).replace(',', '.');
  if (raw.length === 0) return { ok: false, message: `${label} boş olamaz.` };

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return { ok: false, message: `${label} sayı olmalı.` };

  return { ok: true, value: parsed };
}

export type QuestionOptionEdit = {
  readonly tr: string;
  readonly en: string;
};

export type QuestionEdit = {
  readonly slug: string;
  readonly prompt_tr: string;
  readonly prompt_en: string;
  readonly options: readonly QuestionOptionEdit[];
  readonly correct_index: number;
  readonly difficulty_weight: number;
  readonly explanation_tr: string | null;
  readonly explanation_en: string | null;
  readonly is_active: boolean;
};

/**
 * Soru formu.
 *
 * Şıklar `options_count` kadar okunuyor: form şık ekleyip
 * çıkarabiliyor ve indeksler her gönderimde sıfırdan sıkışık
 * geliyor, böylece silinen bir şık arada boşluk bırakmıyor.
 *
 * Doğru şık radyo düğmesiyle seçiliyor, elle indeks yazılmıyor —
 * yoksa bir şık silindiğinde indeks sessizce başka bir şıkkı
 * gösterirdi. Yine de aralık burada da kontrol ediliyor: form
 * doğru çalışmasa bile yanlış veri yazılmasın.
 */
export function parseQuestion(values: FormValues): Parsed<QuestionEdit> {
  const slug = required(values, 'slug', 'Kimlik');
  if (!slug.ok) return slug;

  const promptTr = required(values, 'prompt_tr', 'Türkçe soru metni');
  if (!promptTr.ok) return promptTr;

  const promptEn = required(values, 'prompt_en', 'İngilizce soru metni');
  if (!promptEn.ok) return promptEn;

  const count = integer(values, 'options_count', 'Şık sayısı');
  if (!count.ok) return count;
  if (count.value < 2) return { ok: false, message: 'Soruda en az iki şık olmalı.' };

  const options: QuestionOptionEdit[] = [];
  for (let index = 0; index < count.value; index += 1) {
    const tr = text(values, `option_tr_${index}`);
    const en = text(values, `option_en_${index}`);

    if (tr.length === 0 || en.length === 0) {
      return { ok: false, message: `${index + 1}. şık iki dilde de dolu olmalı.` };
    }

    options.push({ tr, en });
  }

  const correct = integer(values, 'correct_index', 'Doğru şık');
  if (!correct.ok) return correct;
  if (correct.value < 0 || correct.value >= options.length) {
    return { ok: false, message: 'Doğru şık, şıklardan biri olmalı.' };
  }

  const weight = decimal(values, 'difficulty_weight', 'Zorluk ağırlığı');
  if (!weight.ok) return weight;
  if (weight.value <= 0) return { ok: false, message: 'Zorluk ağırlığı sıfırdan büyük olmalı.' };

  // Açıklama isteğe bağlı; boş bırakılırsa sütun null oluyor, boş
  // dizgi değil — "açıklama yok" ile "açıklama boş" aynı şey değil.
  const explanationTr = text(values, 'explanation_tr');
  const explanationEn = text(values, 'explanation_en');

  return {
    ok: true,
    value: {
      slug: slug.value,
      prompt_tr: promptTr.value,
      prompt_en: promptEn.value,
      options,
      correct_index: correct.value,
      difficulty_weight: weight.value,
      explanation_tr: explanationTr.length === 0 ? null : explanationTr,
      explanation_en: explanationEn.length === 0 ? null : explanationEn,
      is_active: text(values, 'is_active') === 'on',
    },
  };
}
