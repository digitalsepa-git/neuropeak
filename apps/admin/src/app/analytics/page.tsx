import { ANALYTICS_EVENTS } from '@neuropeak/core';

import { Shell } from '@/components/shell';
import { contentMode } from '@/lib/content-mode';
import { NO_METRICS, fetchMetrics, type Metrics } from '@/lib/metrics';

/**
 * Analitik.
 *
 * Sayılar veritabanındaki toplama işlevlerinden geliyor; panel ham
 * olay satırı okumuyor. Okunamayan her sayı "—" kalıyor: sıfır bir
 * ölçüm, "—" ölçüm olmadığı. Analitik ekranı yanlış sayı gösterirse
 * işlevini tam tersine çevirir, o yüzden uydurma grafik yok.
 */

const RETENTION_LABELS: Readonly<Record<number, string>> = {
  1: 'İlk gününden tam bir gün sonra geri dönenler',
  7: 'İlk gününden tam yedi gün sonra geri dönenler',
  30: 'İlk gününden tam otuz gün sonra geri dönenler',
};

function percent(part: number, whole: number): string {
  if (whole === 0) return '—';
  return `%${Math.round((part / whole) * 100)}`;
}

export default async function AnalyticsPage() {
  const metrics: Metrics = contentMode === 'live' ? await fetchMetrics() : NO_METRICS;
  const { overview, funnel, retention } = metrics;

  const show = (value: number | undefined): string => (value === undefined ? '—' : `${value}`);

  const headline = [
    {
      label: 'Günlük aktif',
      value: show(overview?.dailyActive),
      hint: 'Bugün en az bir olay gönderen kullanıcı',
    },
    {
      label: 'Haftalık aktif',
      value: show(overview?.weeklyActive),
      hint: 'Son 7 günde en az bir olay',
    },
    {
      label: 'Yeni kullanıcı',
      value: show(overview?.newToday),
      hint: 'Profili bugün açılan',
    },
    {
      label: 'PRO dönüşüm',
      value:
        overview === undefined || overview === null
          ? '—'
          : percent(overview.subscribers, overview.paywallViewers),
      hint: 'Paywall görenlerin abone olma oranı',
    },
  ];

  return (
    <Shell
      title="Analitik"
      description="Toplanan olaylar, aktivasyon hunisi ve tutundurma. Toplamlar veritabanında hesaplanıyor; panel ham olay okumuyor."
    >
      {/* Bağlantı yokken kabuk zaten söylüyor; burada tekrar
          etmek iki kutu üst üste bindiriyordu. */}
      {overview === null && contentMode === 'live' && <Unavailable />}

      <section className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
        {headline.map((metric) => (
          <article
            key={metric.label}
            className="rounded-lg border border-border bg-surface p-md shadow-card"
          >
            <p className="text-overline font-semibold tracking-wide text-fg-subtle uppercase">
              {metric.label}
            </p>
            <p className="mt-1 text-title font-bold tracking-tight tabular-nums">{metric.value}</p>
            <p className="mt-1 text-caption text-fg-muted">{metric.hint}</p>
          </article>
        ))}
      </section>

      <section className="mt-xl">
        <h2 className="mb-md text-subheading font-semibold">Aktivasyon hunisi</h2>
        <p className="mb-md text-bodysmall text-fg-muted">
          Her adım, kendinden önceki bütün adımları da yapmış kullanıcıları sayar.
        </p>

        <ol className="space-y-xs">
          {(funnel.length > 0 ? funnel : PLACEHOLDER_FUNNEL).map((step, index) => (
            <li
              key={step.event}
              className="flex items-center gap-sm rounded-lg border border-border bg-surface px-md py-sm"
            >
              <span className="w-5 shrink-0 text-caption text-fg-subtle tabular-nums">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-bodysmall font-medium">{step.label}</span>
                <span className="block text-caption text-fg-muted">{step.event}</span>
              </span>
              {funnel.length > 0 && index > 0 && (
                <span className="shrink-0 text-caption text-fg-muted tabular-nums">
                  %{Math.round(step.ratio * 100)}
                </span>
              )}
              <span className="w-12 shrink-0 text-right text-bodysmall tabular-nums">
                {funnel.length > 0 ? step.users : '—'}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-xl">
        <h2 className="mb-md text-subheading font-semibold">Tutundurma</h2>
        <div className="grid gap-md sm:grid-cols-3">
          {(retention.length > 0 ? retention : PLACEHOLDER_RETENTION).map((row) => (
            <article
              key={row.day}
              className="rounded-lg border border-border bg-surface p-md shadow-card"
            >
              <p className="text-overline font-semibold tracking-wide text-fg-subtle uppercase">
                {row.day}. gün
              </p>
              <p className="mt-1 text-title font-bold tracking-tight tabular-nums">
                {retention.length === 0 ? '—' : percent(row.returned, row.cohort)}
              </p>
              <p className="mt-1 text-caption text-fg-muted">
                {RETENTION_LABELS[row.day]}
                {retention.length > 0 && row.cohort > 0 && ` · ${row.cohort} kişilik kohort`}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-xl">
        <h2 className="mb-md text-subheading font-semibold">Olay kataloğu</h2>
        <p className="mb-md text-bodysmall text-fg-muted">
          Uygulamanın gönderdiği olaylar. Liste tek kaynaktan geliyor; serbest metinle olay
          gönderilmiyor.
        </p>

        <ul className="flex flex-wrap gap-xs">
          {ANALYTICS_EVENTS.map((event) => (
            <li
              key={event}
              className="rounded-pill border border-border bg-surface px-sm py-1.5 font-mono text-caption"
            >
              {event}
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}

/**
 * Sayılar okunamadığında yapı yine görünüyor — hangi olaylar
 * toplanıyor, huni hangi adımlardan oluşuyor — ama her sayı "—".
 */
const PLACEHOLDER_FUNNEL = [
  { event: 'app_open', label: 'Uygulamayı açtı', users: 0, ratio: 0 },
  { event: 'onboarding_complete', label: 'Kurulumu bitirdi', users: 0, ratio: 0 },
  { event: 'test_complete', label: 'İlk testi bitirdi', users: 0, ratio: 0 },
  { event: 'game_complete', label: 'Oyun oynadı', users: 0, ratio: 0 },
  { event: 'paywall_view', label: 'Paywall gördü', users: 0, ratio: 0 },
  { event: 'purchase_complete', label: 'Abone oldu', users: 0, ratio: 0 },
];

const PLACEHOLDER_RETENTION = [
  { day: 1, cohort: 0, returned: 0 },
  { day: 7, cohort: 0, returned: 0 },
  { day: 30, cohort: 0, returned: 0 },
];

function Unavailable() {
  return (
    <div className="mb-lg rounded-lg border border-border bg-surface-sunken p-md">
      <p className="text-bodysmall font-semibold">Sayılar okunamadı</p>
      <p className="mt-1 text-bodysmall text-fg-muted">
        Veritabanı bağlı ama toplamlar gelmedi: bu hesabın yönetici yetkisi olmayabilir.
      </p>
    </div>
  );
}
