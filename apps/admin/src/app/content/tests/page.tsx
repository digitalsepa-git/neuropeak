import Link from 'next/link';

import { Shell } from '@/components/shell';
import { listOtherTests, listQuestionTests, type TestSummary } from '@/lib/content-source';

/**
 * Test listesi.
 *
 * İki tablo: soru havuzlu testler ve soru sormayanlar. Havuzlu
 * testlerde yönetilecek şey havuz — kaç soru var, kaçı soruluyor,
 * ortalama zorluk ne. Beyin Yaşı ölçüm yaptırıyor, profil testlerinin
 * doğru cevabı yok; onları aynı sütunlara sıkıştırmak boş hücreler
 * üretirdi.
 */

const FOCUS_LABELS: Record<string, string> = {
  verbal: 'Sözel',
  numeric: 'Sayısal',
  visual: 'Görsel',
  logical: 'Mantık',
};

export default function TestsPage() {
  const questionTests = listQuestionTests();
  const otherTests = listOtherTests();
  const total = questionTests.length + otherTests.length;

  return (
    <Shell
      title="Testler"
      description={`Uygulamanın sunduğu ${total} test. Soru havuzlu olanlar ve ölçüm/profil testleri ayrı listelerde.`}
    >
      <section className="mb-xl">
        <div className="mb-md flex items-baseline gap-sm">
          <h2 className="text-subheading font-semibold">Soru havuzlu testler</h2>
          <span className="text-caption text-fg-muted">{questionTests.length} test</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full text-bodysmall">
            <thead>
              <tr className="border-b border-border text-left text-overline tracking-wide text-fg-subtle uppercase">
                <th className="px-md py-sm font-semibold">Test</th>
                <th className="px-md py-sm font-semibold">Alan</th>
                <th className="px-md py-sm text-right font-semibold">Havuz</th>
                <th className="px-md py-sm text-right font-semibold">Sorulan</th>
                <th className="px-md py-sm text-right font-semibold">Ort. zorluk</th>
                <th className="px-md py-sm text-right font-semibold">Süre</th>
                <th className="px-md py-sm font-semibold">Erişim</th>
              </tr>
            </thead>
            <tbody>
              {questionTests.map((test) => (
                <tr key={test.id} className="border-b border-border last:border-0">
                  <td className="px-md py-sm">
                    <Link href={test.href} className="font-medium text-brand hover:underline">
                      {test.title}
                    </Link>
                  </td>
                  <td className="px-md py-sm text-fg-muted">
                    {test.questions?.focus === undefined
                      ? 'Genel'
                      : FOCUS_LABELS[test.questions.focus]}
                  </td>
                  <td className="px-md py-sm text-right tabular-nums">
                    {test.questions?.poolSize}
                  </td>
                  <td className="px-md py-sm text-right tabular-nums">{test.questions?.asked}</td>
                  <td className="px-md py-sm text-right tabular-nums">
                    {test.questions?.averageWeight}
                  </td>
                  <td className="px-md py-sm text-right tabular-nums text-fg-muted">
                    {test.estMinutes[0]}–{test.estMinutes[1]} dk
                  </td>
                  <td className="px-md py-sm">
                    <AccessBadge isPro={test.isPro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-md flex items-baseline gap-sm">
          <h2 className="text-subheading font-semibold">Ölçüm ve profil testleri</h2>
          <span className="text-caption text-fg-muted">{otherTests.length} test</span>
        </div>

        <p className="mb-md text-bodysmall text-fg-muted">
          Bunların soru havuzu yok: Beyin Yaşı dört ölçüm yaptırıyor, profil testlerinin doğru
          cevabı yok — her şık bir eksene puan yazıyor.
        </p>

        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full text-bodysmall">
            <thead>
              <tr className="border-b border-border text-left text-overline tracking-wide text-fg-subtle uppercase">
                <th className="px-md py-sm font-semibold">Test</th>
                <th className="px-md py-sm font-semibold">Tür</th>
                <th className="px-md py-sm font-semibold">Ölçek</th>
                <th className="px-md py-sm text-right font-semibold">Süre</th>
                <th className="px-md py-sm font-semibold">Erişim</th>
              </tr>
            </thead>
            <tbody>
              {otherTests.map((test) => (
                <tr key={test.id} className="border-b border-border last:border-0">
                  <td className="px-md py-sm">
                    <Link href={test.href} className="font-medium text-brand hover:underline">
                      {test.title}
                    </Link>
                  </td>
                  <td className="px-md py-sm text-fg-muted">{familyLabel(test.family)}</td>
                  <td className="px-md py-sm text-fg-muted">{test.scale}</td>
                  <td className="px-md py-sm text-right tabular-nums text-fg-muted">
                    {test.estMinutes[0]}–{test.estMinutes[1]} dk
                  </td>
                  <td className="px-md py-sm">
                    <AccessBadge isPro={test.isPro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}

function familyLabel(family: TestSummary['family']): string {
  switch (family) {
    case 'questions':
      return 'Soru havuzu';
    case 'measures':
      return 'Ölçüm';
    case 'profile':
      return 'Profil';
  }
}

function AccessBadge({ isPro }: { isPro: boolean }) {
  return (
    <span
      className={`rounded-pill px-xs py-0.5 text-overline font-semibold tracking-wide uppercase ${
        isPro ? 'bg-brand text-on-brand' : 'bg-surface-sunken text-fg-muted'
      }`}
    >
      {isPro ? 'PRO' : 'Ücretsiz'}
    </span>
  );
}
