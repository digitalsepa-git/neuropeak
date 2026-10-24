import { ACTIVATION_FUNNEL } from '@neuropeak/core';

import { createClient } from './auth';

/**
 * Analitik sayıları.
 *
 * Toplamlar veritabanında hesaplanıyor: `admin_overview`,
 * `admin_funnel`, `admin_retention`. Panel ham olay satırı
 * okumuyor — okuyamıyor da, `analytics_events` istemciye kapalı.
 * Böylece ekran kaç kişinin ne yaptığını gösteriyor, kimin ne
 * yaptığını değil.
 *
 * İşlevler yönetici değilse hata veriyor; burada hata "sayı yok"
 * diye okunuyor ve arayüz "—" gösteriyor. Sıfır ile bilinmiyor
 * aynı şey değil: sıfır bir ölçüm, "—" ölçüm olmadığı.
 */

export type Overview = {
  readonly dailyActive: number;
  readonly weeklyActive: number;
  readonly newToday: number;
  readonly paywallViewers: number;
  readonly subscribers: number;
};

export type FunnelRow = {
  readonly event: string;
  readonly label: string;
  readonly users: number;
  /** İlk adıma göre oran (0–1); ilk adım sıfırsa 0. */
  readonly ratio: number;
};

export type RetentionRow = {
  readonly day: number;
  readonly cohort: number;
  readonly returned: number;
};

export type Metrics = {
  readonly overview: Overview | null;
  readonly funnel: readonly FunnelRow[];
  readonly retention: readonly RetentionRow[];
};

/** Hiçbir şey okunamadığında: her yer "—". */
export const NO_METRICS: Metrics = { overview: null, funnel: [], retention: [] };

export function toFunnelRows(
  rows: readonly { event: string; users: number }[],
): readonly FunnelRow[] {
  const byEvent = new Map(rows.map((row) => [row.event, row.users]));
  const first = byEvent.get(ACTIVATION_FUNNEL[0]?.event ?? '') ?? 0;

  return ACTIVATION_FUNNEL.map((step) => {
    const users = byEvent.get(step.event) ?? 0;
    return {
      event: step.event,
      label: step.label,
      users,
      // İlk adım sıfırken oran tanımsız; sıfır göstermek, "kimse
      // geçmedi" demekten daha doğru çünkü kimse girmemiş.
      ratio: first === 0 ? 0 : users / first,
    };
  });
}

export async function fetchMetrics(): Promise<Metrics> {
  const supabase = await createClient();
  if (supabase === null) return NO_METRICS;

  const [overview, funnel, retention] = await Promise.all([
    supabase.rpc('admin_overview'),
    supabase.rpc('admin_funnel'),
    supabase.rpc('admin_retention'),
  ]);

  const row = (overview.data as { [key: string]: number }[] | null)?.[0];

  return {
    overview:
      overview.error !== null || row === undefined
        ? null
        : {
            dailyActive: row.daily_active ?? 0,
            weeklyActive: row.weekly_active ?? 0,
            newToday: row.new_today ?? 0,
            paywallViewers: row.paywall_viewers ?? 0,
            subscribers: row.subscribers ?? 0,
          },
    funnel:
      funnel.error !== null
        ? []
        : toFunnelRows((funnel.data ?? []) as { event: string; users: number }[]),
    retention:
      retention.error !== null
        ? []
        : ((retention.data ?? []) as RetentionRow[]).map((item) => ({
            day: item.day,
            cohort: item.cohort,
            returned: item.returned,
          })),
  };
}
