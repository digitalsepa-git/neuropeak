import {
  CONTENT_TESTS,
  PROFILE_TESTS,
  brainAgeTest,
  type ContentTest,
  type ProfileTest,
} from '@neuropeak/content';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { QuestionTable } from '@/components/question-table';
import { Shell } from '@/components/shell';
import { canEditContent, contentMode } from '@/lib/content-mode';
import { getMeasureTest, getProfileTest, getTest, kindBreakdown } from '@/lib/content-source';

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
 *
 * Üç türün hepsi burada: soru havuzlu testler, Beyin Yaşı ve profil
 * testleri. Biri eksik kalırsa o testin sayfası 404 verir.
 */
export function generateStaticParams() {
  // Canlı modda liste veritabanında; derleme anında bilinmiyor ve
  // sayfalar istek anında üretiliyor. Gömülü modda hepsi belli.
  if (contentMode === 'live') return [];

  return [
    ...CONTENT_TESTS.map((test) => ({ id: test.id })),
    { id: brainAgeTest.id },
    ...PROFILE_TESTS.map((test) => ({ id: test.id })),
  ];
}

export default async function TestDetailPage({ params }: PageProps<'/content/tests/[id]'>) {
  const { id } = await params;

  const questionTest = await getTest(id);
  if (questionTest !== undefined) return <QuestionTestView test={questionTest} />;

  const measureTest = await getMeasureTest(id);
  if (measureTest !== undefined) return <MeasureTestView />;

  const profileTest = await getProfileTest(id);
  if (profileTest !== undefined) return <ProfileTestView test={profileTest} />;

  notFound();
}

function QuestionTestView({ test }: { test: ContentTest }) {
  const breakdown = kindBreakdown(test.questions);

  return (
    <Shell title={test.title.tr} description={test.description.tr}>
      <BackLink />

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

/**
 * Beyin Yaşı. Soru yok, dört ölçüm var; sayfanın göstereceği şey
 * ölçümler ve testin kendi uyarısı. Uyarı burada da duruyor çünkü
 * içeriği yöneten kişi, çıkan yaşın bir ölçüm olmadığını uygulamada
 * olduğu gibi burada da görmeli.
 */
function MeasureTestView() {
  return (
    <Shell title={brainAgeTest.title.tr} description={brainAgeTest.description.tr}>
      <BackLink />

      <section className="grid gap-md sm:grid-cols-3">
        <Fact label="Ölçüm" value={`${brainAgeTest.steps.length} adım`} />
        <Fact
          label="Tahmini süre"
          value={`${brainAgeTest.estMinutes[0]}–${brainAgeTest.estMinutes[1]} dk`}
        />
        <Fact label="Erişim" value={brainAgeTest.isPro ? 'PRO' : 'Ücretsiz'} />
      </section>

      <Caveat text={brainAgeTest.caveat.tr} />

      <section className="mt-xl">
        <h2 className="mb-md text-subheading font-semibold">Ölçümler</h2>
        <ul className="space-y-sm">
          {brainAgeTest.steps.map((step) => (
            <li
              key={step.measure}
              className="rounded-lg border border-border bg-surface p-md shadow-card"
            >
              <div className="flex items-baseline justify-between gap-sm">
                <h3 className="font-semibold">{step.title.tr}</h3>
                <span className="shrink-0 text-caption text-fg-muted tabular-nums">
                  ~{step.seconds} sn
                </span>
              </div>
              <p className="mt-1 text-bodysmall text-fg-muted">{step.instruction.tr}</p>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}

/**
 * Profil testi. Doğru cevap yok; yönetilecek şey eksenler, her şıkkın
 * hangi eksene kaç puan yazdığı ve varsa arketipler.
 */
function ProfileTestView({ test }: { test: ProfileTest }) {
  return (
    <Shell title={test.title.tr} description={test.description.tr}>
      <BackLink />

      <section className="grid gap-md sm:grid-cols-3">
        <Fact label="Soru" value={`${test.questions.length} soru`} />
        <Fact label="Eksen" value={`${test.traits.length} eksen`} />
        <Fact
          label="Sonuç"
          value={test.outcomes === undefined ? 'Eksen haritası' : `${test.outcomes.length} arketip`}
        />
        <Fact label="Tahmini süre" value={`${test.estMinutes[0]}–${test.estMinutes[1]} dk`} />
        <Fact label="Erişim" value={test.isPro ? 'PRO' : 'Ücretsiz'} />
      </section>

      <Caveat text={test.caveat.tr} />

      <section className="mt-xl">
        <h2 className="mb-md text-subheading font-semibold">Eksenler</h2>
        <ul className="space-y-xs">
          {test.traits.map((trait) => (
            <li key={trait.id} className="rounded-lg border border-border bg-surface px-md py-sm">
              <span className="font-medium">{trait.label.tr}</span>
              <span className="ml-xs text-caption text-fg-subtle">{trait.id}</span>
              <p className="mt-0.5 text-bodysmall text-fg-muted">{trait.description.tr}</p>
            </li>
          ))}
        </ul>
      </section>

      {test.outcomes !== undefined && (
        <section className="mt-xl">
          <h2 className="mb-md text-subheading font-semibold">Arketipler</h2>
          <ul className="space-y-xs">
            {test.outcomes.map((outcome) => (
              <li
                key={outcome.id}
                className="rounded-lg border border-border bg-surface px-md py-sm"
              >
                <div className="flex flex-wrap items-baseline gap-xs">
                  <span className="font-medium">{outcome.title.tr}</span>
                  <span className="text-caption text-fg-subtle">{outcome.traits.join(' + ')}</span>
                </div>
                <p className="mt-0.5 text-bodysmall text-fg-muted">{outcome.description.tr}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-xl">
        <h2 className="mb-md text-subheading font-semibold">Sorular ve eksen puanları</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full text-bodysmall">
            <thead>
              <tr className="border-b border-border text-left text-overline tracking-wide text-fg-subtle uppercase">
                <th className="px-md py-sm font-semibold">Soru</th>
                <th className="px-md py-sm font-semibold">Şık</th>
                <th className="px-md py-sm font-semibold">Eksen puanı</th>
              </tr>
            </thead>
            <tbody>
              {test.questions.map((question, questionIndex) =>
                question.options.map((option, optionIndex) => (
                  <tr
                    key={`${question.id}-${optionIndex}`}
                    className="border-b border-border last:border-0"
                  >
                    {optionIndex === 0 && (
                      <td className="px-md py-sm align-top" rowSpan={question.options.length}>
                        <span className="text-fg-subtle tabular-nums">{questionIndex + 1}. </span>
                        {question.prompt.tr}
                      </td>
                    )}
                    <td className="px-md py-sm text-fg-muted">{option.label.tr}</td>
                    <td className="px-md py-sm">
                      {Object.entries(option.weights)
                        .map(([trait, weight]) => `${trait} +${weight}`)
                        .join(' · ')}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}

function BackLink() {
  return (
    <p className="mb-lg text-bodysmall">
      <Link href="/content/tests" className="text-brand hover:underline">
        ← Testler
      </Link>
    </p>
  );
}

/** Testin kendi uyarısı; uygulamada da aynı cümle gösteriliyor. */
function Caveat({ text }: { text: string }) {
  return (
    <div className="mt-lg rounded-lg border border-border bg-surface-sunken p-md">
      <p className="text-overline font-semibold tracking-wide text-fg-subtle uppercase">
        Uygulamada gösterilen uyarı
      </p>
      <p className="mt-1 text-bodysmall text-fg-muted">{text}</p>
    </div>
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
