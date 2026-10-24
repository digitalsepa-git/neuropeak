import type { GameMode } from '../domain/categories';
import { createRng, seedFromString, shuffle } from '../random';

/**
 * Oyun başına ilerleme.
 *
 * XP, seri ve beyin haritası bütün oyunları tek potada topluyor; bu
 * kayıt ise her oyunun kendi hikâyesini tutuyor: nereye kadar geldin,
 * en iyi skorun ne, kaç kez oynadın, en son ne zaman.
 *
 * İki karar burada açıkça yazılı:
 *
 * 1. `best`ın anlamı oyunun kipine göre değişiyor. Seviyeli oyunlarda
 *    ulaşılan en yüksek seviye — tamamlanan değil ulaşılan, çünkü
 *    yarıda kalan seviyeye tekrar oradan dönmek gerekiyor. Süreli
 *    oyunlarda bir turda yapılan en çok iş (cevap, tur, hamle).
 *
 * 2. Kayıt zorluğa göre ayrılmıyor. Zorluk bir seviyenin içindeki işi
 *    büyütüyor, seviye sayısını değiştirmiyor; üç ayrı kayıt tutmak
 *    kartta hangisini göstereceğimizi de belirsizleştirirdi. Kolayda
 *    ilerleyip zorda o seviyeden devam etmek mümkün, ama zorluk her
 *    turda yeniden seçildiği için bu bir çıkmaz değil.
 */

export type GameRecord = {
  /** Seviyeli oyunda ulaşılan en yüksek seviye, süreli oyunda bir turdaki en çok iş. */
  readonly best: number;
  /** Bir turda alınmış en yüksek skor; oyunlar arası karşılaştırılmaz. */
  readonly bestScore: number;
  readonly plays: number;
  /** 'YYYY-MM-DD'; hiç oynanmadıysa null. */
  readonly lastPlayed: string | null;
};

export type GameProgress = Readonly<Record<string, GameRecord>>;

export const EMPTY_GAME_RECORD: GameRecord = {
  best: 0,
  bestScore: 0,
  plays: 0,
  lastPlayed: null,
};

/** Kaydı okur; hiç oynanmamış oyun için boş kayıt döner. */
export function gameRecord(progress: GameProgress, gameId: string): GameRecord {
  return progress[gameId] ?? EMPTY_GAME_RECORD;
}

export function hasPlayed(progress: GameProgress, gameId: string): boolean {
  return gameRecord(progress, gameId).plays > 0;
}

/**
 * Biten bir turu kayda işler.
 *
 * En iyiler yalnızca yükselir: kötü bir tur, daha önce ulaşılmış
 * seviyeyi geri almıyor.
 */
export function recordGameResult(
  progress: GameProgress,
  gameId: string,
  round: { readonly level: number; readonly score: number; readonly date: string },
): GameProgress {
  const current = gameRecord(progress, gameId);

  return {
    ...progress,
    [gameId]: {
      best: Math.max(current.best, Math.max(0, Math.floor(round.level))),
      bestScore: Math.max(current.bestScore, Math.max(0, Math.floor(round.score))),
      plays: current.plays + 1,
      lastPlayed: round.date,
    },
  };
}

/**
 * Turun başlayacağı seviye.
 *
 * Süreli oyunlarda seviye yok, her tur baştan başlıyor. Seviyeli
 * oyunlarda kalınan yerden devam ediliyor; son seviye de geçilmişse
 * orada duruyor, çünkü katalogdaki seviyeden ötesi tanımlı değil.
 */
export function resumeLevel(
  record: GameRecord,
  game: { readonly mode: GameMode; readonly totalLevels: number },
): number {
  if (game.mode === 'timed') return 1;

  const ceiling = game.totalLevels > 0 ? game.totalLevels : Number.MAX_SAFE_INTEGER;
  return Math.min(Math.max(1, record.best), ceiling);
}

/** Oynanmış oyun sayısı; "29 oyunun 12'sini denedin" gibi özetler için. */
export function playedGameCount(progress: GameProgress): number {
  return Object.values(progress).filter((record) => record.plays > 0).length;
}

/**
 * En son oynanandan eskiye. Aynı gün oynanan oyunlar arasında çok
 * oynanan önde; tam eşitlikte kimlik sırası, böylece liste her
 * açılışta aynı sırada duruyor.
 */
export function recentlyPlayed(progress: GameProgress, limit: number): readonly string[] {
  return Object.entries(progress)
    .filter(([, record]) => record.plays > 0 && record.lastPlayed !== null)
    .sort(([idA, a], [idB, b]) => {
      const dateA = a.lastPlayed ?? '';
      const dateB = b.lastPlayed ?? '';
      if (dateA !== dateB) return dateA < dateB ? 1 : -1;
      if (a.plays !== b.plays) return b.plays - a.plays;
      return idA < idB ? -1 : 1;
    })
    .slice(0, Math.max(0, limit))
    .map(([id]) => id);
}

/**
 * Günün önerilen oyunu.
 *
 * Önce hiç denenmemişler arasından seçiliyor: katalogda 29 oyun var ve
 * öneri bunları tanıtmanın en doğal yolu. Hepsi denenmişse en uzun
 * süre dönülmemiş oyun öneriliyor.
 *
 * Sıra kullanıcı ve güne göre bir kez karılıyor, öneri o sıradaki ilk
 * denenmemiş oyun. Oynanmamışları önce ayıklayıp aralarından seçmek
 * kolay olurdu ama başka bir oyun oynandığında liste kayıp öneriyi de
 * değiştiriyordu; bu sırayla yalnızca önerilen oyun oynandığında
 * sıradakine geçiliyor.
 */
export function pickSuggestedGame(
  gameIds: readonly string[],
  progress: GameProgress,
  seed: { readonly userId: string; readonly dateKey: string },
): string | undefined {
  if (gameIds.length === 0) return undefined;

  const rng = createRng(seedFromString(`${seed.userId}:${seed.dateKey}:suggestion`));
  const order = shuffle(gameIds, rng);

  const unplayed = order.find((id) => !hasPlayed(progress, id));
  if (unplayed !== undefined) return unplayed;

  // Hepsi oynanmış: en eski dönülene geri çağır. `recentlyPlayed`
  // yeniden eskiye sıralıyor, sondaki en uzun süredir dokunulmayan.
  const byRecency = recentlyPlayed(progress, gameIds.length);
  return byRecency[byRecency.length - 1] ?? gameIds[0];
}
