'use client';

import type { ContentQuestion } from '@neuropeak/content';
import { useMemo, useState } from 'react';

import { canEditContent } from '@/lib/content-source';

/**
 * Soru listesi. Düzenleme açılana kadar işin çoğu gözden geçirmek:
 * doğru şık işaretli, zorluk ağırlığı ve iki dildeki metin bir arada
 * görünsün. Arama ve tür süzgeci bu yüzden en baştan var — 75 soruluk
 * bir havuzda aranan soruyu bulmak listeyi kaydırmakla olmuyor.
 */
export function QuestionTable({
  questions,
  kindLabels,
}: {
  questions: readonly ContentQuestion[];
  kindLabels: Record<string, string>;
}) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const kinds = useMemo(
    () => [...new Set(questions.map((question) => question.kind))].sort(),
    [questions],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr');

    return questions.filter((question) => {
      if (kind !== 'all' && question.kind !== kind) return false;
      if (needle.length === 0) return true;

      const haystack = [
        question.id,
        question.prompt.tr,
        question.prompt.en,
        ...question.options.map((option) => option.tr),
      ]
        .join(' ')
        .toLocaleLowerCase('tr');

      return haystack.includes(needle);
    });
  }, [kind, query, questions]);

  return (
    <div>
      <div className="mb-md flex flex-wrap items-center gap-xs">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Soru, şık veya kimlik ara"
          aria-label="Sorularda ara"
          className="min-w-56 flex-1 rounded-md border border-border bg-surface px-sm py-1.5 text-bodysmall outline-none focus:border-brand"
        />

        <select
          value={kind}
          onChange={(event) => setKind(event.target.value)}
          aria-label="Soru türü"
          className="rounded-md border border-border bg-surface px-sm py-1.5 text-bodysmall outline-none focus:border-brand"
        >
          <option value="all">Tüm türler</option>
          {kinds.map((item) => (
            <option key={item} value={item}>
              {kindLabels[item] ?? item}
            </option>
          ))}
        </select>

        <span className="text-caption text-fg-muted tabular-nums">
          {filtered.length} / {questions.length}
        </span>
      </div>

      <ul className="space-y-xs">
        {filtered.map((question) => {
          const isOpen = openId === question.id;

          return (
            <li
              key={question.id}
              className="rounded-lg border border-border bg-surface shadow-card"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : question.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-sm px-md py-sm text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-bodysmall font-medium">
                    {question.prompt.tr}
                  </span>
                  <span className="mt-0.5 block text-caption text-fg-muted">
                    {question.id} · {kindLabels[question.kind] ?? question.kind} · ağırlık{' '}
                    {question.difficultyWeight}
                  </span>
                </span>
                <span aria-hidden className="shrink-0 text-fg-muted">
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-border px-md py-sm">
                  <p className="text-caption text-fg-muted">EN: {question.prompt.en}</p>

                  <ol className="mt-sm space-y-1">
                    {question.options.map((option, index) => (
                      <li
                        key={option.tr}
                        className={`flex items-center gap-xs rounded-md px-sm py-1 text-bodysmall ${
                          index === question.correctIndex
                            ? 'bg-success/10 font-medium'
                            : 'text-fg-muted'
                        }`}
                      >
                        <span className="tabular-nums">{index + 1}.</span>
                        <span>{option.tr}</span>
                        <span className="text-caption text-fg-subtle">/ {option.en}</span>
                        {index === question.correctIndex && (
                          <span className="ml-auto text-overline font-semibold tracking-wide text-success uppercase">
                            Doğru
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>

                  {question.explanation !== undefined && (
                    <p className="mt-sm text-bodysmall text-fg-muted">{question.explanation.tr}</p>
                  )}

                  <button
                    type="button"
                    disabled={!canEditContent}
                    className="mt-md rounded-md border border-border px-sm py-1 text-bodysmall disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Düzenle
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="rounded-lg border border-border bg-surface p-md text-bodysmall text-fg-muted">
          Aramayla eşleşen soru yok.
        </p>
      )}
    </div>
  );
}
