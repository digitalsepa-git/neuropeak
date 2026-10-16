import { ACTIVATION_FUNNEL, ANALYTICS_EVENTS } from '@neuropeak/core';

import { Shell } from '@/components/shell';
import { isSupabaseConfigured } from '@/lib/supabase';

/**
 * Analitik.
 *
 * Sayılar kullanıcı verisi ister; bağlantı yokken hepsi "—". Gösterilen
 * şey yapı: hangi olaylar toplanıyor, huni hangi adımlardan oluşuyor,
 * tutundurma hangi günlerde ölçülüyor. Uydurma grafik çizmek burada
 * en kötü seçenek olurdu — analitik ekranı yanlış sayı gösterirse
 * işlevini tam tersine çevirir.
 */
const RETENTION_DAYS = [1, 7, 30];

const HEADLINE_METRICS = [
  { label: 'Günlük aktif', hint: 'Bugün en az bir olay gönderen kullanıcı' },
  { label: 'Haftalık aktif', hint: 'Son 7 günde en az bir olay' },
  { label: 'Yeni kullanıcı', hint: 'Bugün ilk kez görülen' },
  { label: 'PRO dönüşüm', hint: 'Paywall görenlerin abone olma oranı' },
];

export default function AnalyticsPage() {
  const value = isSupabaseConfigured ? '0' : '—';

  return (
    <Shell
      title="Analitik"
      description="Toplanan olaylar, aktivasyon hunisi ve tutundurma. Sayılar bağlantı kurulunca dolar."
    >
      <section className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
        {HEADLINE_METRICS.map((metric) => (
          <article
            key={metric.label}
            className="rounded-lg border border-border bg-surface p-md shadow-card"
          >
            <p className="text-overline font-semibold tracking-wide text-fg-subtle uppercase">
              {metric.label}
            </p>
            <p className="mt-1 text-title font-bold tracking-tight tabular-nums">{value}</p>
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
          {ACTIVATION_FUNNEL.map((step, index) => (
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
              <span className="shrink-0 text-bodysmall tabular-nums">{value}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-xl">
        <h2 className="mb-md text-subheading font-semibold">Tutundurma</h2>
        <div className="grid gap-md sm:grid-cols-3">
          {RETENTION_DAYS.map((day) => (
            <article
              key={day}
              className="rounded-lg border border-border bg-surface p-md shadow-card"
            >
              <p className="text-overline font-semibold tracking-wide text-fg-subtle uppercase">
                {day}. gün
              </p>
              <p className="mt-1 text-title font-bold tracking-tight tabular-nums">{value}</p>
              <p className="mt-1 text-caption text-fg-muted">
                İlk gününden tam {day} gün sonra geri dönenler
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
