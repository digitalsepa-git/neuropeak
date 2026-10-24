import { BADGES, type ContentBadge } from '@neuropeak/content';
import { badgeTierLabel, describeBadgeRequirement, type BadgeTier } from '@neuropeak/core';

import { Shell } from '@/components/shell';

/**
 * Rozet kataloğu.
 *
 * İki sütun yan yana duruyor: oyuncunun gördüğü açıklama ve rozetin
 * gerçekte baktığı koşul. Katalogda açıklama pazarlama dili ("Yol
 * alıyor"), koşul ise veri; ikisi ayrıştığında — koşul değişip
 * açıklama güncellenmediğinde — burada yan yana görünüyor.
 *
 * Gizli rozetler listede duruyor ve işaretli: panel içeriği yönetmek
 * için, oyuncunun sürprizi mobil tarafın işi.
 */

const TIERS: readonly BadgeTier[] = [1, 2, 3, 4];

export default function BadgesPage() {
  const byTier = TIERS.map((tier) => ({
    tier,
    badges: BADGES.filter((badge) => badge.tier === tier),
  })).filter((group) => group.badges.length > 0);

  const secretCount = BADGES.filter((badge) => badge.isSecret).length;
  const totalStars = BADGES.reduce((sum, badge) => sum + badge.starReward, 0);

  return (
    <Shell
      title="Rozetler"
      description="Kazanma koşulları ve yıldız ödülleri. Koşullar veri olarak tutuluyor; buradaki cümleler o veriden üretiliyor."
    >
      <section className="mb-xl grid gap-md sm:grid-cols-3">
        <Stat label="Rozet" value={`${BADGES.length}`} />
        <Stat label="Gizli" value={`${secretCount}`} />
        <Stat label="Toplanabilir yıldız" value={`${totalStars}`} />
      </section>

      {byTier.map((group) => (
        <section key={group.tier} className="mb-xl last:mb-0">
          <div className="mb-md flex items-baseline gap-sm">
            <h2 className="text-subheading font-semibold">{badgeTierLabel(group.tier)}</h2>
            <span className="text-caption text-fg-muted">{group.badges.length} rozet</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
            <table className="w-full text-bodysmall">
              <thead>
                <tr className="border-b border-border text-left text-overline tracking-wide text-fg-subtle uppercase">
                  <th className="px-md py-sm font-semibold">Rozet</th>
                  <th className="px-md py-sm font-semibold">Oyuncuya görünen</th>
                  <th className="px-md py-sm font-semibold">Koşul</th>
                  <th className="px-md py-sm text-right font-semibold">Yıldız</th>
                </tr>
              </thead>
              <tbody>
                {group.badges.map((badge) => (
                  <BadgeRow key={badge.id} badge={badge} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </Shell>
  );
}

function BadgeRow({ badge }: { badge: ContentBadge }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-md py-sm">
        <div className="flex items-center gap-xs">
          <span className="font-medium">{badge.title.tr}</span>
          {badge.isSecret && (
            <span className="rounded-pill bg-surface-sunken px-1.5 text-overline font-semibold tracking-wide text-fg-muted uppercase">
              Gizli
            </span>
          )}
        </div>
        <p className="text-caption text-fg-subtle">{badge.id}</p>
      </td>
      <td className="px-md py-sm text-fg-muted">{badge.description.tr}</td>
      <td className="px-md py-sm">{describeBadgeRequirement(badge.requirement)}</td>
      <td className="px-md py-sm text-right tabular-nums">{badge.starReward}</td>
    </tr>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-md shadow-card">
      <p className="text-overline font-semibold tracking-wide text-fg-subtle uppercase">{label}</p>
      <p className="mt-1 text-title font-bold tracking-tight">{value}</p>
    </article>
  );
}
