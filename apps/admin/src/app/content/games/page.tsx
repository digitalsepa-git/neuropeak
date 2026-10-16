import { GAME_CATALOGUE } from '@neuropeak/content';
import { GAME_CATEGORIES, type GameCategory } from '@neuropeak/core';
import { categoryAccent } from '@neuropeak/ui';

import { GameTable } from '@/components/game-table';
import { Shell } from '@/components/shell';

const CATEGORY_LABELS: Record<GameCategory, string> = {
  memory: 'Hafıza',
  attention: 'Odaklanma',
  logic: 'Mantık',
  math: 'Matematik',
  spatial: 'Görsel-Uzamsal',
  speed: 'Hız',
  verbal: 'Sözel',
};

export default function GamesPage() {
  const byCategory = GAME_CATEGORIES.map((category) => ({
    category,
    count: GAME_CATALOGUE.filter((game) => game.category === category).length,
  }));

  const levelled = GAME_CATALOGUE.filter((game) => game.mode === 'levels').length;

  return (
    <Shell
      title="Oyunlar"
      description="Oyun kataloğu: kategori, yapı, XP değeri ve geliştirdiği yetenekler."
    >
      <section className="grid gap-md sm:grid-cols-3">
        <Fact label="Oyun" value={`${GAME_CATALOGUE.length}`} />
        <Fact label="Seviyeli" value={`${levelled}`} />
        <Fact label="Süreli" value={`${GAME_CATALOGUE.length - levelled}`} />
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
        <GameTable games={GAME_CATALOGUE} categoryLabels={CATEGORY_LABELS} />
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
