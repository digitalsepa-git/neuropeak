import { CONTENT_TESTS } from '@neuropeak/content';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { QuestionTable } from '@/components/question-table';
import { Shell } from '@/components/shell';
import { canEditContent, getTest, kindBreakdown } from '@/lib/content-source';

const KIND_LABELS: Record<string, string> = {
  matrix: 'Matris',
  number_series: 'Sayı dizisi',
  shape_analogy: 'Şekil analojisi',
  verbal_analogy: 'Sözel analoji',
  logic: 'Mantık',
  spatial: 'Uzamsal',
  coding: 'Kodlama',
  odd_one_out: 'Farklı olan',
  arithmetic: 'Aritmetik',
};

/**
 * Gömülü içerikte test listesi derleme anında bilinir; sayfalar
 * önceden üretiliyor. Supabase bağlandığında bu liste veritabanından
 * gelecek ve sayfa istek anında render edilecek.
 */
export function generateStaticParams() {
  return CONTENT_TESTS.map((test) => ({ id: test.id }));
}

export default async function TestDetailPage({ params }: PageProps<'/content/tests/[id]'>) {
  const { id } = await params;
  const test = getTest(id);

  if (test === undefined) notFound();

  const breakdown = kindBreakdown(test.questions);

  return (
    <Shell title={test.title.tr} description={test.description.tr}>
      <p className="mb-lg text-bodysmall">
        <Link href="/content/tests" className="text-brand hover:underline">
          ← Testler
        </Link>
      </p>

      <section className="grid gap-md sm:grid-cols-3">
        <Fact label="Havuz" value={`${test.questions.length} soru`} />
        <Fact label="Oturumda sorulan" value={`${test.questionCount} soru`} />
        <Fact label="Tahmini süre" value={`${test.estMinutes[0]}–${test.estMinutes[1]} dk`} />
        <Fact label="Erişim" value={test.isPro ? 'PRO' : 'Ücretsiz'} />
        <Fact label="Norm ortalaması" value={`${test.norm.mean}`} />
        <Fact label="Norm sapması" value={`${test.norm.sd}`} />
      </section>

      <section className="mt-xl">
        <h2 className="mb-md text-subheading font-semibold">Soru türü dağılımı</h2>
        <ul className="flex flex-wrap gap-xs">
          {breakdown.map((item) => (
            <li
              key={item.kind}
              className="rounded-pill border border-border bg-surface px-sm py-1.5 text-bodysmall"
            >
              {KIND_LABELS[item.kind] ?? item.kind}
              <span className="ml-xs text-fg-muted tabular-nums">{item.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-xl">
        <div className="mb-md flex items-baseline justify-between gap-sm">
          <h2 className="text-subheading font-semibold">Sorular</h2>
          {!canEditContent && (
            <span className="text-caption text-fg-muted">Düzenleme Supabase bağlanınca açılır</span>
          )}
        </div>

        <QuestionTable questions={test.questions} kindLabels={KIND_LABELS} />
      </section>
    </Shell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-md shadow-card">
      <p className="text-overline font-semibold tracking-wide text-fg-subtle uppercase">{label}</p>
      <p className="mt-1 text-subheading font-semibold">{value}</p>
    </article>
  );
}
