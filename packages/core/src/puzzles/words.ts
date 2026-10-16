import { createRng, shuffle, type Rng } from '../random';

/**
 * Sözel bulmacalar.
 *
 * Sayısal ve görsel bulmacaların aksine sözel içerik kurallardan
 * türetilemez: bir kelimenin eş anlamlısı ya da iki kelime arasındaki
 * ilişki dilin kendisinde yazılıdır. Bu yüzden buradaki üreteçler
 * kelime bankasını dışarıdan alır — banka `@neuropeak/content`'te
 * durur ve ileride admin panelinden yönetilecek. Üreteçlerin işi
 * bankadan tohuma göre seçim yapmak, şıkları karıştırmak ve oyunun
 * kurallarını (tekrar eden şık olmaması, anagramın kelimeye eşit
 * olmaması) garanti etmek.
 */

/** Kelime Avı için bir kelime ve ipucu. */
export type AnagramEntry = {
  /** Küçük harfli, Türkçe karakterli kelime. */
  readonly word: string;
  readonly clue: string;
};

export type AnagramPuzzle = {
  readonly word: string;
  readonly clue: string;
  /** Karıştırılmış harfler; her zaman kelimenin bir permütasyonu. */
  readonly letters: readonly string[];
};

/** "A : B :: C : ?" sorusu ve çeldiricileri. */
export type AnalogyEntry = {
  readonly id: string;
  readonly left: readonly [string, string];
  readonly right: string;
  readonly answer: string;
  readonly distractors: readonly [string, string, string];
  /** İlişkinin adı; doğru cevaptan sonra gösterilir. */
  readonly relation: string;
  /** 1 en kolay, 5 en zor. */
  readonly level: number;
};

export type AnalogyPuzzle = {
  /** Bankadaki sorunun kimliği; bir sonraki soruyu üretirken elenir. */
  readonly id: string;
  readonly left: readonly [string, string];
  readonly right: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
  readonly relation: string;
};

export type WordPairMode = 'synonym' | 'antonym';

/** Eş/zıt anlam sorusu. */
export type WordPairEntry = {
  readonly id: string;
  readonly word: string;
  readonly mode: WordPairMode;
  readonly answer: string;
  readonly distractors: readonly [string, string, string];
};

export type WordPairPuzzle = {
  /** Bankadaki sorunun kimliği; bir sonraki soruyu üretirken elenir. */
  readonly id: string;
  readonly word: string;
  readonly mode: WordPairMode;
  readonly options: readonly string[];
  readonly correctIndex: number;
};

/** Seviyeye göre kaç harfli kelimeler sorulacağı. */
export function anagramLengthForLevel(level: number): number {
  return Math.min(8, 4 + Math.floor((level - 1) / 3));
}

function scramble(word: string, rng: Rng): string[] {
  const letters = [...word];
  if (letters.length < 2) return letters;

  // Karıştırma kelimenin kendisine denk gelirse oyuncuya yapacak iş
  // kalmaz; farklı bir diziliş bulunana kadar tekrar karıştırılıyor.
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = shuffle(letters, rng);
    if (candidate.join('') !== word) return candidate;
  }

  // Tüm harfleri aynı olan kelime (ör. "aaa") — kaydırmak da bir şey
  // değiştirmez, olduğu gibi dönülüyor.
  return letters;
}

/**
 * Bir önceki soruyu havuzdan eler. Havuz tek soruya düşecekse eleme
 * yapılmaz: tekrar etmek, soru üretememekten iyidir.
 */
function withoutPrevious<T>(pool: readonly T[], isPrevious: (item: T) => boolean): readonly T[] {
  const filtered = pool.filter((item) => !isPrevious(item));
  return filtered.length > 0 ? filtered : pool;
}

/**
 * Seviyeye uygun uzunlukta bir kelime seçer. O uzunlukta kelime yoksa
 * bankadaki en yakın uzunluğa düşer, böylece banka seyrek olsa bile
 * üreteç boş dönmez.
 */
function pickByLength(
  entries: readonly AnagramEntry[],
  length: number,
  rng: Rng,
  previousWord: string | undefined,
): AnagramEntry {
  if (entries.length === 0) throw new RangeError('Kelime bankası boş');

  const lengths = [...new Set(entries.map((entry) => entry.word.length))];
  const closest = lengths.reduce((best, candidate) =>
    Math.abs(candidate - length) < Math.abs(best - length) ? candidate : best,
  );

  const pool = withoutPrevious(
    entries.filter((entry) => entry.word.length === closest),
    (entry) => entry.word === previousWord,
  );

  return pool[Math.floor(rng() * pool.length)] as AnagramEntry;
}

/**
 * @param previousWord Son sorulan kelime; art arda aynı kelimenin
 * gelmemesi için havuzdan çıkarılır.
 */
export function generateAnagram(
  entries: readonly AnagramEntry[],
  level: number,
  seed: number,
  previousWord?: string,
): AnagramPuzzle {
  const rng = createRng(seed);
  const entry = pickByLength(entries, anagramLengthForLevel(level), rng, previousWord);

  return {
    word: entry.word,
    clue: entry.clue,
    letters: scramble(entry.word, rng),
  };
}

/**
 * Seviyeye uygun zorlukta bir analoji seçer; yoksa en yakınına düşer.
 *
 * @param previousId Son sorulan sorunun kimliği; kademede başka soru
 * varsa aynısı tekrar sorulmaz.
 */
export function generateWordAnalogy(
  entries: readonly AnalogyEntry[],
  level: number,
  seed: number,
  previousId?: string,
): AnalogyPuzzle {
  if (entries.length === 0) throw new RangeError('Analoji bankası boş');

  const rng = createRng(seed);
  const target = Math.min(5, Math.max(1, Math.ceil(level / 3)));

  const levels = [...new Set(entries.map((entry) => entry.level))];
  const closest = levels.reduce((best, candidate) =>
    Math.abs(candidate - target) < Math.abs(best - target) ? candidate : best,
  );

  const pool = withoutPrevious(
    entries.filter((entry) => entry.level === closest),
    (entry) => entry.id === previousId,
  );

  const entry = pool[Math.floor(rng() * pool.length)] as AnalogyEntry;
  const options = shuffle([entry.answer, ...entry.distractors], rng);

  return {
    id: entry.id,
    left: entry.left,
    right: entry.right,
    options,
    correctIndex: options.indexOf(entry.answer),
    relation: entry.relation,
  };
}

/**
 * @param previousId Son sorulan sorunun kimliği; süreli oyunda sorular
 * hızlı aktığı için art arda tekrar en çok burada göze batar.
 */
export function generateWordPair(
  entries: readonly WordPairEntry[],
  seed: number,
  previousId?: string,
): WordPairPuzzle {
  if (entries.length === 0) throw new RangeError('Kelime çifti bankası boş');

  const rng = createRng(seed);
  const pool = withoutPrevious(entries, (entry) => entry.id === previousId);
  const entry = pool[Math.floor(rng() * pool.length)] as WordPairEntry;
  const options = shuffle([entry.answer, ...entry.distractors], rng);

  return {
    id: entry.id,
    word: entry.word,
    mode: entry.mode,
    options,
    correctIndex: options.indexOf(entry.answer),
  };
}
