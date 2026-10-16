/**
 * Analitik olayları.
 *
 * Olay adları tek bir yerde duruyor: uygulama buradan gönderiyor,
 * panel buradan listeliyor. Serbest metinle olay göndermek, altı ay
 * sonra `game_start` ile `gameStarted`ı ayrı iki olay olarak görmekle
 * bitiyor.
 *
 * Huni ve tutundurma hesapları da burada çünkü ikisi de saf: olay
 * listesini alıp sayı döndürüyorlar, veritabanına bakmıyorlar. Panel
 * ileride olayları sorguyla çekip bu fonksiyonlara verecek.
 */

export const ANALYTICS_EVENTS = [
  'app_open',
  'onboarding_start',
  'onboarding_complete',
  'test_start',
  'test_complete',
  'game_start',
  'game_complete',
  'paywall_view',
  'paywall_dismiss',
  'purchase_start',
  'purchase_complete',
  'ad_watched',
  'badge_earned',
  'league_promoted',
  'push_opened',
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsRecord = {
  readonly name: AnalyticsEvent;
  readonly userId: string;
  /** Olayın gerçekleştiği an. */
  readonly at: Date;
};

export type FunnelStep = {
  readonly event: AnalyticsEvent;
  readonly label: string;
};

/** Kurulumdan satın almaya giden yol; panelde bu sırayla çiziliyor. */
export const ACTIVATION_FUNNEL: readonly FunnelStep[] = [
  { event: 'app_open', label: 'Uygulamayı açtı' },
  { event: 'onboarding_complete', label: 'Kurulumu bitirdi' },
  { event: 'test_complete', label: 'İlk testi bitirdi' },
  { event: 'game_complete', label: 'Oyun oynadı' },
  { event: 'paywall_view', label: 'Paywall gördü' },
  { event: 'purchase_complete', label: 'Abone oldu' },
];

export type FunnelResult = {
  readonly step: FunnelStep;
  readonly users: number;
  /** İlk adıma göre oran (0–1). */
  readonly ratio: number;
};

/**
 * Huni: her adımı **ve kendinden önceki bütün adımları** yapmış
 * kullanıcı sayısı. Sırayı yoksayıp sadece olayı saymak, huniyi
 * olduğundan geniş gösterirdi.
 */
export function funnel(
  steps: readonly FunnelStep[],
  records: readonly AnalyticsRecord[],
): FunnelResult[] {
  const byUser = new Map<string, Set<string>>();
  for (const record of records) {
    const seen = byUser.get(record.userId) ?? new Set<string>();
    seen.add(record.name);
    byUser.set(record.userId, seen);
  }

  const counts = steps.map(
    (step, index) =>
      [...byUser.values()].filter((seen) =>
        steps.slice(0, index + 1).every((previous) => seen.has(previous.event)),
      ).length,
  );

  const first = counts[0] ?? 0;

  return steps.map((step, index) => ({
    step,
    users: counts[index] ?? 0,
    ratio: first === 0 ? 0 : (counts[index] ?? 0) / first,
  }));
}

const DAY_MS = 86_400_000;

/**
 * N. gün tutundurma: ilk gününde görülen kullanıcıların kaçı tam N gün
 * sonra geri geldi. "N gün içinde" değil "N. günde" — ikisi farklı ve
 * karıştırılınca rakamlar olduğundan iyi görünüyor.
 */
export function retention(
  records: readonly AnalyticsRecord[],
  day: number,
): { readonly cohort: number; readonly returned: number; readonly ratio: number } {
  const firstSeen = new Map<string, number>();
  const days = new Map<string, Set<number>>();

  for (const record of records) {
    const dayIndex = Math.floor(record.at.getTime() / DAY_MS);
    const existing = firstSeen.get(record.userId);

    if (existing === undefined || dayIndex < existing) firstSeen.set(record.userId, dayIndex);

    const seen = days.get(record.userId) ?? new Set<number>();
    seen.add(dayIndex);
    days.set(record.userId, seen);
  }

  const cohort = firstSeen.size;
  let returned = 0;

  for (const [userId, start] of firstSeen) {
    if (days.get(userId)?.has(start + day) === true) returned += 1;
  }

  return { cohort, returned, ratio: cohort === 0 ? 0 : returned / cohort };
}

/** Olay adına göre toplam sayım; panelde olay kataloğunun yanında duruyor. */
export function countByEvent(
  records: readonly AnalyticsRecord[],
): { readonly name: AnalyticsEvent; readonly count: number }[] {
  const counts = new Map<AnalyticsEvent, number>();
  for (const record of records) {
    counts.set(record.name, (counts.get(record.name) ?? 0) + 1);
  }

  return ANALYTICS_EVENTS.map((name) => ({ name, count: counts.get(name) ?? 0 }));
}
