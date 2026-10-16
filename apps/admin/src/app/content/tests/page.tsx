import Link from 'next/link';

import { Shell } from '@/components/shell';
import { listTests } from '@/lib/content-source';

const FOCUS_LABELS: Record<string, string> = {
  verbal: 'Sözel',
  numeric: 'Sayısal',
  visual: 'Görsel',
  logical: 'Mantık',
};

export default function TestsPage() {
  const tests = listTests();

  return (
    <Shell
      title="Testler"
      description="Soru havuzları, oturum başına sorulan soru sayısı ve erişim seviyeleri."
    >
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
            {tests.map((test) => (
              <tr key={test.id} className="border-b border-border last:border-0">
                <td className="px-md py-sm">
                  <Link
                    href={`/content/tests/${test.id}`}
                    className="font-medium text-brand hover:underline"
                  >
                    {test.title}
                  </Link>
                </td>
                <td className="px-md py-sm text-fg-muted">
                  {test.focus === undefined ? 'Genel' : FOCUS_LABELS[test.focus]}
                </td>
                <td className="px-md py-sm text-right tabular-nums">{test.poolSize}</td>
                <td className="px-md py-sm text-right tabular-nums">{test.questionCount}</td>
                <td className="px-md py-sm text-right tabular-nums">{test.averageWeight}</td>
                <td className="px-md py-sm text-right tabular-nums text-fg-muted">
                  {test.estMinutes[0]}–{test.estMinutes[1]} dk
                </td>
                <td className="px-md py-sm">
                  <span
                    className={`rounded-pill px-xs py-0.5 text-overline font-semibold tracking-wide uppercase ${
                      test.isPro ? 'bg-brand text-on-brand' : 'bg-surface-sunken text-fg-muted'
                    }`}
                  >
                    {test.isPro ? 'PRO' : 'Ücretsiz'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
