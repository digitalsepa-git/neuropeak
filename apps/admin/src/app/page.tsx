import { BADGES, CONTENT_TESTS, GAME_CATALOGUE } from '@neuropeak/content';
import Link from 'next/link';

import { Shell } from '@/components/shell';
import { listTests, totalQuestionCount } from '@/lib/content-source';

export default function DashboardPage() {
  const tests = listTests();
  const questions = totalQuestionCount();
  const proTests = tests.filter((test) => test.isPro).length;

  const stats = [
    { label: 'Test', value: `${tests.length}` },
    { label: 'Soru (tekil)', value: `${questions}` },
    { label: 'PRO test', value: `${proTests}` },
    { label: 'Oyun', value: `${GAME_CATALOGUE.length}` },
    { label: 'Rozet', value: `${BADGES.length}` },
  ];

  return (
    <Shell title="Genel bakış" description="İçerik bankasının mevcut durumu ve hızlı erişim.">
      <section className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-lg border border-border bg-surface p-md shadow-card"
          >
            <p className="text-overline font-semibold tracking-wide text-fg-subtle uppercase">
              {stat.label}
            </p>
            <p className="mt-1 text-title font-bold tracking-tight">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-xl">
        <div className="mb-md flex items-baseline justify-between gap-sm">
          <h2 className="text-subheading font-semibold">Testler</h2>
          <Link href="/content/tests" className="text-bodysmall text-brand hover:underline">
            Tümünü yönet
          </Link>
        </div>

        <ul className="space-y-xs">
          {CONTENT_TESTS.map((test) => (
            <li key={test.id}>
              <Link
                href={`/content/tests/${test.id}`}
                className="flex items-center justify-between gap-sm rounded-lg border border-border bg-surface px-md py-sm hover:bg-surface-sunken"
              >
                <span className="min-w-0 truncate text-bodysmall font-medium">{test.title.tr}</span>
                <span className="shrink-0 text-caption text-fg-muted">
                  {test.questions.length} soruluk havuz
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
