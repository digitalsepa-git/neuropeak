import { GAME_CATEGORIES, type GameCategory } from '@neuropeak/core';
import { categoryAccent } from '@neuropeak/ui';

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

const CATEGORY_LABELS: Record<GameCategory, string> = {
  memory: 'Hafıza',
  attention: 'Odaklanma',
  logic: 'Mantık',
  math: 'Matematik',
  spatial: 'Görsel',
  speed: 'Hız',
  verbal: 'Sözel',
};

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-lg py-xl2">
      <header className="mb-xl">
        <p className="text-caption font-medium text-brand">NeuroPeak: IQ Arena</p>
        <h1 className="mt-1 text-title font-bold tracking-tight">Yönetim Paneli</h1>
        <p className="mt-2 text-fg-muted">Altyapı kuruldu. Modüller sırayla devreye alınacak.</p>
      </header>

      <section className="grid gap-md sm:grid-cols-2">
        {MODULES.map((module) => (
          <article
            key={module.title}
            className="rounded-lg border border-border bg-surface p-md shadow-card"
          >
            <div className="flex items-start justify-between gap-sm">
              <h2 className="text-subheading font-semibold">{module.title}</h2>
              <span className="shrink-0 rounded-pill bg-surface-sunken px-xs py-0.5 text-overline font-semibold tracking-wide text-fg-muted uppercase">
                {module.pr}
              </span>
            </div>
            <p className="mt-2 text-bodysmall text-fg-muted">{module.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-xl">
        <h2 className="text-overline font-semibold tracking-wide text-fg-subtle uppercase">
          Oyun kategorileri
        </h2>
        <ul className="mt-md flex flex-wrap gap-xs">
          {GAME_CATEGORIES.map((category) => (
            <li
              key={category}
              className="flex items-center gap-xs rounded-pill border border-border bg-surface px-sm py-1.5 text-bodysmall"
            >
              <span
                aria-hidden
                className="size-2.5 rounded-pill"
                style={{ backgroundColor: categoryAccent[category] }}
              />
              {CATEGORY_LABELS[category]}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
