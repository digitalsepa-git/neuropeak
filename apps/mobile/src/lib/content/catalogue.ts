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
  type ContentTest,
  type MeasureTest,
  type ProfileTest,
} from '@neuropeak/content';

/**
 * Uygulamanın o an kullandığı içerik.
 *
 * İki kaynak var: uygulamayla birlikte gelen gömülü banka ve
 * veritabanı. Gömülü banka her zaman elimizde — ağ yokken, Supabase
 * yapılandırılmamışken ya da sorgu boş dönerken uygulama onunla
 * çalışıyor. Bu bilinçli: uygulama çevrimdışı oynanabiliyor ve boş
 * bir ekran kabul edilemez.
 */

export type Catalogue = {
  readonly games: readonly ContentGame[];
  readonly tests: readonly ContentTest[];
  readonly badges: readonly ContentBadge[];
  readonly dailyTasks: readonly ContentDailyTask[];
  readonly profileTests: readonly ProfileTest[];
  readonly measureTests: readonly MeasureTest[];
};

/** Uygulamayla gelen banka; yedek de bu, ilk açılışta görünen de. */
export const EMBEDDED_CATALOGUE: Catalogue = {
  games: GAME_CATALOGUE,
  tests: CONTENT_TESTS,
  badges: BADGES,
  dailyTasks: DAILY_TASKS,
  profileTests: PROFILE_TESTS,
  measureTests: [brainAgeTest],
};

/**
 * Veritabanından gelen içerikte, bu uygulama sürümünün
 * oynayamayacağı şeyler olabilir: panelden yeni bir oyun eklenmiş
 * ama onu çizen ekran bu sürümde yok. Katalogda görünüp açılınca
 * patlamasındansa listeye hiç girmemesi doğru.
 *
 * Aynı şey soru türleri için de geçerli: tanımadığı bir türü çizmeye
 * çalışan ekran boş kalırdı.
 */
export function compatibleCatalogue(
  catalogue: Catalogue,
  support: {
    readonly playableGameIds: ReadonlySet<string>;
    readonly knownQuestionKinds: ReadonlySet<string>;
  },
): Catalogue {
  const tests = catalogue.tests
    .map((test) => ({
      ...test,
      questions: test.questions.filter((question) => support.knownQuestionKinds.has(question.kind)),
    }))
    // Bütün soruları elenmiş bir test açılamaz; listede durması
    // kullanıcıyı boş bir ekrana götürürdü.
    .filter((test) => test.questions.length > 0);

  return {
    ...catalogue,
    games: catalogue.games.filter((game) => support.playableGameIds.has(game.id)),
    tests,
  };
}

/**
 * Uzak içerikte bir bölüm boş geldiyse o bölüm için gömülü bankaya
 * düşülüyor — hepsine birden değil.
 *
 * Bölüm bölüm düşmek, bir sorgunun boş dönmesinin diğerlerini de
 * götürmesini engelliyor: rozetler gelmediyse oyunlar yine
 * veritabanından okunuyor.
 */
export function withFallback(remote: Partial<Catalogue>): Catalogue {
  const pick = <K extends keyof Catalogue>(key: K): Catalogue[K] => {
    const value = remote[key];
    return value !== undefined && value.length > 0 ? value : EMBEDDED_CATALOGUE[key];
  };

  return {
    games: pick('games'),
    tests: pick('tests'),
    badges: pick('badges'),
    dailyTasks: pick('dailyTasks'),
    profileTests: pick('profileTests'),
    measureTests: pick('measureTests'),
  };
}
