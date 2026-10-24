'use client';

import type { ContentGame } from '@neuropeak/content';
import type { GameCategory } from '@neuropeak/core';
import { categoryAccent } from '@neuropeak/ui';
import { useMemo, useState } from 'react';

import { canEditContent } from '@/lib/content-mode';

import { GameEditor } from './game-editor';

const MODE_LABELS = { levels: 'Seviyeli', timed: 'Süreli' } as const;

/**
 * Oyun kataloğu listesi. Testlerdeki soru listesiyle aynı mantık:
 * düzenleme açılana kadar iş gözden geçirmek, o yüzden satır açılınca
 * oyunun yönergesi, açıklaması ve geliştirdiği yetenekler bir arada
 * görünüyor.
 */
export function GameTable({
  games,
  categoryLabels,
}: {
  games: readonly ContentGame[];
  categoryLabels: Record<GameCategory, string>;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(games.map((game) => game.category))].sort(),
    [games],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr');

    return games.filter((game) => {
      if (category !== 'all' && game.category !== category) return false;
      if (needle.length === 0) return true;

      return [game.id, game.title, game.instruction, game.description, ...game.skills]
        .join(' ')
        .toLocaleLowerCase('tr')
        .includes(needle);
    });
  }, [category, games, query]);

  return (
    <div>
      <div className="mb-md flex flex-wrap items-center gap-xs">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Oyun adı, yönerge veya yetenek ara"
          aria-label="Oyunlarda ara"
          className="min-w-56 flex-1 rounded-md border border-border bg-surface px-sm py-1.5 text-bodysmall outline-none focus:border-brand"
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Kategori"
          className="rounded-md border border-border bg-surface px-sm py-1.5 text-bodysmall outline-none focus:border-brand"
        >
          <option value="all">Tüm kategoriler</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {categoryLabels[item]}
            </option>
          ))}
        </select>

        <span className="text-caption text-fg-muted tabular-nums">
          {filtered.length} / {games.length}
        </span>
      </div>

      <ul className="space-y-xs">
        {filtered.map((game) => {
          const isOpen = openId === game.id;

          return (
            <li key={game.id} className="rounded-lg border border-border bg-surface shadow-card">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : game.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-sm px-md py-sm text-left"
              >
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-pill"
                  style={{ backgroundColor: categoryAccent[game.category] }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-bodysmall font-medium">{game.title.tr}</span>
                  <span className="mt-0.5 block text-caption text-fg-muted">
                    {game.id} · {categoryLabels[game.category]} · {MODE_LABELS[game.mode]} ·{' '}
                    {game.baseXp} XP
                  </span>
                </span>
                <span aria-hidden className="shrink-0 text-fg-muted">
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-border px-md py-sm">
                  <p className="text-bodysmall">{game.instruction.tr}</p>
                  <p className="mt-1 text-bodysmall text-fg-muted">{game.description.tr}</p>

                  <ul className="mt-sm flex flex-wrap gap-xs">
                    {game.skills.map((skill) => (
                      <li
                        key={skill.tr}
                        className="rounded-pill bg-surface-sunken px-sm py-0.5 text-caption text-fg-muted"
                      >
                        {skill.tr}
                      </li>
                    ))}
                  </ul>

                  {/* İngilizce karşılıklar da burada: panelden metin
                      düzenlenirken iki dilin birlikte görünmesi, birini
                      güncelleyip diğerini unutmayı zorlaştırıyor. */}
                  <div className="mt-sm border-t border-border pt-sm">
                    <p className="text-caption font-medium text-fg-muted">EN</p>
                    <p className="mt-1 text-bodysmall">{game.title.en}</p>
                    <p className="text-bodysmall text-fg-muted">{game.instruction.en}</p>
                    <p className="mt-1 text-bodysmall text-fg-muted">{game.description.en}</p>
                  </div>

                  <p className="mt-sm text-caption text-fg-muted">
                    {game.mode === 'levels'
                      ? `${game.totalLevels} seviye`
                      : 'Süreli — seviye sayısı yok'}
                  </p>

                  {editingId === game.id ? (
                    <GameEditor game={game} onClose={() => setEditingId(null)} />
                  ) : (
                    <button
                      type="button"
                      disabled={!canEditContent}
                      onClick={() => setEditingId(game.id)}
                      className="mt-md rounded-md border border-border px-sm py-1 text-bodysmall disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Düzenle
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="rounded-lg border border-border bg-surface p-md text-bodysmall text-fg-muted">
          Aramayla eşleşen oyun yok.
        </p>
      )}
    </div>
  );
}
