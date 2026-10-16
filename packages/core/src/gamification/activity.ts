import type { GameCategory } from '../domain/categories';

/**
 * Günlük etkinlik geçmişi — İlerleme sekmesindeki haftalık grafiğin ve
 * kategori dağılımının kaynağı.
 *
 * Geçmiş kısa tutuluyor: cihazda saklanan bu kayıt bir günlük defteri
 * değil, son iki haftanın özeti. Daha eskisi gerektiğinde Supabase'den
 * gelecek.
 */

export const HISTORY_DAYS = 14;

export type DayActivity = {
  /** 'YYYY-MM-DD'. */
  readonly date: string;
  readonly xp: number;
  readonly rounds: number;
};

/** Günü geçmişe işler; aynı gün varsa üstüne ekler. */
export function recordDayActivity(
  history: readonly DayActivity[],
  date: string,
  gain: { xp: number; rounds: number },
): DayActivity[] {
  const existing = history.find((day) => day.date === date);

  const updated: DayActivity =
    existing === undefined
      ? { date, xp: gain.xp, rounds: gain.rounds }
      : { date, xp: existing.xp + gain.xp, rounds: existing.rounds + gain.rounds };

  return [...history.filter((day) => day.date !== date), updated]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-HISTORY_DAYS);
}

function shiftDate(date: string, days: number): string {
  const time = Date.parse(`${date}T00:00:00Z`) + days * 86_400_000;
  return new Date(time).toISOString().slice(0, 10);
}

/**
 * Bugünden geriye `count` günlük dizi; oynanmayan günler sıfırla
 * doldurulur, böylece grafikte boşluk değil düşük bir çubuk görünür.
 */
export function lastDays(
  history: readonly DayActivity[],
  today: string,
  count: number,
): DayActivity[] {
  const byDate = new Map(history.map((day) => [day.date, day]));

  return Array.from({ length: count }, (_, index) => {
    const date = shiftDate(today, index - (count - 1));
    return byDate.get(date) ?? { date, xp: 0, rounds: 0 };
  });
}

export type CategoryCounts = Partial<Record<GameCategory, number>>;

export function recordCategoryRound(
  counts: CategoryCounts,
  category: GameCategory,
): CategoryCounts {
  return { ...counts, [category]: (counts[category] ?? 0) + 1 };
}

/** Çok oynanandan aza doğru; grafikte bu sırayla çiziliyor. */
export function rankCategories(
  counts: CategoryCounts,
): { category: GameCategory; count: number }[] {
  return (Object.entries(counts) as [GameCategory, number][])
    .filter(([, count]) => count > 0)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || (a.category < b.category ? -1 : 1));
}
