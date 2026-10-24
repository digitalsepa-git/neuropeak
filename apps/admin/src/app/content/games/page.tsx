import { GAME_CATEGORIES, type GameCategory } from '@neuropeak/core';
import { categoryAccent } from '@neuropeak/ui';

import { GameTable } from '@/components/game-table';
import { EmptyContent } from '@/components/empty-content';
import { Shell } from '@/components/shell';
import { listGames } from '@/lib/content-source';

const CATEGORY_LABELS: Record<GameCategory, string> = {
  memory: 'Hafıza',
  attention: 'Odaklanma',
  logic: 'Mantık',
  math: 'Matematik',
  spatial: 'Görsel-Uzamsal',
  speed: 'Hız',
  verbal: 'Sözel',
};

export default async function GamesPage() {
  const games = await listGames();

  const byCategory = GAME_CATEGORIES.map((category) => ({
    category,
    count: games.filter((game) => game.category === category).length,
  }));

  const levelled = games.filter((game) => game.mode === 'levels').length;

  return (
    <Shell
      title="Oyunlar"
      description="Oyun kataloğu: kategori, yapı, XP değeri ve geliştirdiği yetenekler."
    >
      <section className="grid gap-md sm:grid-cols-3">
        <Fact label="Oyun" value={`${games.length}`} />
        <Fact label="Seviyeli" value={`${levelled}`} />
        <Fact label="Süreli" value={`${games.length - levelled}`} />
      </section>

      <section className="mt-xl">
        <h2 className="mb-md text-subheading font-semibold">Kategori dağılımı</h2>
        <ul className="flex flex-wrap gap-xs">
          {byCategory.map((item) => (
            <li
              key={item.category}
              className="flex items-center gap-xs rounded-pill border border-border bg-surface px-sm py-1.5 text-bodysmall"
            >
              <span
                aria-hidden
                className="size-2.5 rounded-pill"
                style={{ backgroundColor: categoryAccent[item.category] }}
              />
              {CATEGORY_LABELS[item.category]}
              <span className="text-fg-muted tabular-nums">{item.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-xl">
        <h2 className="mb-md text-subheading font-semibold">Katalog</h2>
        {games.length === 0 ? (
          <EmptyContent what="Oyun" />
        ) : (
          <GameTable games={games} categoryLabels={CATEGORY_LABELS} />
        )}
      </section>
    </Shell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-md shadow-card">
      <p className="text-overline font-semibold tracking-wide text-fg-subtle uppercase">{label}</p>
      <p className="mt-1 text-title font-bold tracking-tight">{value}</p>
    </article>
  );
}
