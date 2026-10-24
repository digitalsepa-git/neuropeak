import { DEFAULT_SEGMENTS } from '@neuropeak/content';
import { describeRule } from '@neuropeak/core';
import Link from 'next/link';

import { Shell } from '@/components/shell';
import { contentMode } from '@/lib/content-mode';
import { NO_METRICS, fetchMetrics } from '@/lib/metrics';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-md shadow-card">
      <p className="text-overline font-semibold tracking-wide text-fg-subtle uppercase">{label}</p>
      <p className="mt-1 text-title font-bold tracking-tight tabular-nums">{value}</p>
    </article>
  );
}

/**
 * Segment listesi.
 *
 * Segment tanımı yapılandırmadır ve bağlantı olmadan da gerçek;
 * kitle büyüklüğü ise kullanıcı verisi ister. Bu yüzden kurallar
 * olduğu gibi gösteriliyor, sayılar "—" kalıyor. Uydurma bir kitle
 * sayısı göstermek, panelin en yanıltıcı yeri olurdu.
 */
export default async function UsersPage() {
  const { overview } = contentMode === 'live' ? await fetchMetrics() : NO_METRICS;

  return (
    <Shell
      title="Kullanıcılar"
      description="Segment tanımları ve kitle kuralları. Kitle sayıları bağlantı kurulunca gelir."
    >
      <section className="mb-lg grid gap-md sm:grid-cols-3">
        <Stat label="Haftalık aktif" value={overview === null ? '—' : `${overview.weeklyActive}`} />
        <Stat label="PRO üye" value={overview === null ? '—' : `${overview.subscribers}`} />
        <Stat label="Bugün yeni" value={overview === null ? '—' : `${overview.newToday}`} />
      </section>

      <p className="mb-lg text-bodysmall text-fg-muted">
        Segmentlerin kitle sayıları henüz hesaplanmıyor: kural motoru{' '}
        <code className="text-caption">@neuropeak/core</code>&apos;da ve kuralı veritabanında
        değerlendirmek onu ikinci kez yazmak olurdu. Yukarıdaki toplamlar gerçek.
      </p>

      <div className="mb-lg flex flex-wrap items-center gap-sm">
        <Link
          href="/users/push"
          className="rounded-md bg-brand px-md py-1.5 text-bodysmall font-medium text-on-brand"
        >
          Push kampanyası oluştur
        </Link>
        <span className="text-caption text-fg-muted">
          {DEFAULT_SEGMENTS.length} segment tanımlı
        </span>
      </div>

      <ul className="space-y-sm">
        {DEFAULT_SEGMENTS.map((segment) => (
          <li
            key={segment.id}
            className="rounded-lg border border-border bg-surface p-md shadow-card"
          >
            <div className="flex items-start justify-between gap-sm">
              <div className="min-w-0">
                <h2 className="text-subheading font-semibold">{segment.title}</h2>
                <p className="mt-1 text-bodysmall text-fg-muted">{segment.description}</p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-overline font-semibold tracking-wide text-fg-subtle uppercase">
                  Kitle
                </p>
                <p className="text-subheading font-semibold tabular-nums">—</p>
              </div>
            </div>

            <ul className="mt-sm flex flex-wrap gap-xs">
              {segment.rules.length === 0 ? (
                <li className="rounded-pill bg-surface-sunken px-sm py-0.5 text-caption text-fg-muted">
                  Koşul yok
                </li>
              ) : (
                segment.rules.map((rule) => (
                  <li
                    key={describeRule(rule)}
                    className="rounded-pill bg-surface-sunken px-sm py-0.5 text-caption text-fg-muted"
                  >
                    {describeRule(rule)}
                  </li>
                ))
              )}
              {segment.rules.length > 1 && (
                <li className="rounded-pill border border-border px-sm py-0.5 text-caption text-fg-subtle">
                  {segment.match === 'all' ? 'hepsi sağlanmalı' : 'biri yeter'}
                </li>
              )}
            </ul>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
