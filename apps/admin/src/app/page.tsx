import { GAME_CATEGORIES, GAME_CATEGORY_META } from '@neuropeak/core';

/**
 * Geçici panel karşılama ekranı. Gerçek modüller (CMS, CRM, analitik,
 * uzaktan kontrol) PR#21–#23'te gelecek.
 */
const MODULES = [
  { title: 'İçerik (CMS)', description: 'Testler, sorular, oyun yapılandırmaları', pr: 'PR#21' },
  {
    title: 'Kullanıcılar (CRM)',
    description: 'Profiller, abonelikler, segmentler, push',
    pr: 'PR#22',
  },
  { title: 'Analitik', description: 'Retention, funnel, gelir ve oyun metrikleri', pr: 'PR#23' },
  { title: 'Uzaktan Kontrol', description: 'Paywall, fiyat, A/B test, feature flag', pr: 'PR#23' },
] as const;

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="mb-12">
        <p className="text-sm font-medium text-brand">NeuroPeak: IQ Arena</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Yönetim Paneli</h1>
        <p className="mt-2 text-muted">Altyapı kuruldu. Modüller sırayla devreye alınacak.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((module) => (
          <article
            key={module.title}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold">{module.title}</h2>
              <span className="shrink-0 rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted">
                {module.pr}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">{module.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Oyun kategorileri
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {GAME_CATEGORIES.map((category) => (
            <li
              key={category}
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm"
            >
              <span
                aria-hidden
                className="size-2.5 rounded-full"
                style={{ backgroundColor: GAME_CATEGORY_META[category].accentColor }}
              />
              {category}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
