import { BADGES, DAILY_TASKS, GAME_CATALOGUE } from '@neuropeak/content';
import Link from 'next/link';

import { Shell } from '@/components/shell';
import { listOtherTests, listQuestionTests, totalQuestionCount } from '@/lib/content-source';

export default function DashboardPage() {
  const questionTests = listQuestionTests();
  const otherTests = listOtherTests();
  const tests = [...questionTests, ...otherTests];
  const questions = totalQuestionCount();
  const proTests = tests.filter((test) => test.isPro).length;

  // "Soru (tekil)" yalnızca havuzlu testleri sayıyor; ölçüm ve profil
  // testlerinin havuzu yok, onları bu sayıya katmak yanıltırdı.
  const stats = [
    { label: 'Test', value: `${tests.length}` },
    { label: 'Soru havuzu (tekil)', value: `${questions}` },
    { label: 'PRO test', value: `${proTests}` },
    { label: 'Oyun', value: `${GAME_CATALOGUE.length}` },
    { label: 'Rozet', value: `${BADGES.length}` },
    { label: 'Günlük görev', value: `${DAILY_TASKS.length}` },
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
          {tests.map((test) => (
            <li key={test.id}>
              <Link
                href={test.href}
                className="flex items-center justify-between gap-sm rounded-lg border border-border bg-surface px-md py-sm hover:bg-surface-sunken"
              >
                <span className="min-w-0 truncate text-bodysmall font-medium">{test.title}</span>
                <span className="shrink-0 text-caption text-fg-muted">{test.scale}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
