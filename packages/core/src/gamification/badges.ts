import type { BrainAxis, BrainMap } from '../domain/brain-axes';
import { GAME_CATEGORIES, type GameCategory } from '../domain/categories';
import { LEAGUE_TIERS, type LeagueTier } from './league';

/**
 * Rozetler.
 *
 * Rozetin ne zaman kazanıldığı koşulla anlatılıyor, kodla değil: her
 * rozet bir `BadgeRequirement` taşıyor ve motor bunu oyuncunun anlık
 * durumuna karşı değerlendiriyor. Bu sayede rozet eklemek kod değil
 * veri işi — ileride admin panelinden yönetilebilecek.
 *
 * Koşullar hep "şu ana kadar en az şu kadar" biçiminde; bir kez
 * kazanılan rozet geri alınmıyor. Seri gibi düşebilen değerlerde en
 * yüksek değere bakılıyor, yoksa seri kırılınca rozet kaybolurdu.
 */

/** 1 Bronz, 2 Gümüş, 3 Altın, 4 Platin. */
export type BadgeTier = 1 | 2 | 3 | 4;

export type BadgeRequirement =
  | { readonly kind: 'level'; readonly value: number }
  | { readonly kind: 'xp'; readonly value: number }
  | { readonly kind: 'streak'; readonly value: number }
  | { readonly kind: 'rounds'; readonly value: number }
  | { readonly kind: 'tests'; readonly value: number }
  | { readonly kind: 'category_rounds'; readonly category: GameCategory; readonly value: number }
  | { readonly kind: 'all_categories' }
  | { readonly kind: 'axis_score'; readonly axis: BrainAxis; readonly value: number }
  | { readonly kind: 'neuropeak'; readonly value: number }
  | { readonly kind: 'league_tier'; readonly tier: LeagueTier }
  | { readonly kind: 'weekly_xp'; readonly value: number }
  | { readonly kind: 'best_iq'; readonly value: number };

export type BadgeDefinition = {
  readonly id: string;
  readonly tier: BadgeTier;
  readonly starReward: number;
  /** Gizli rozet kazanılmadan listede görünmez. */
  readonly isSecret: boolean;
  readonly requirement: BadgeRequirement;
};

/** Rozet motorunun baktığı anlık durum. */
export type BadgeContext = {
  readonly level: number;
  readonly xp: number;
  /** En uzun seri; güncel seri düşse de rozet geri alınmasın diye. */
  readonly longestStreak: number;
  readonly totalRounds: number;
  readonly testsFinished: number;
  readonly categoryRounds: Partial<Record<GameCategory, number>>;
  readonly brainMap: BrainMap;
  readonly neuropeak: number;
  /** Ulaşılmış en yüksek lig kademesi. */
  readonly bestLeagueTier: LeagueTier;
  /** Bir haftada toplanmış en yüksek XP. */
  readonly bestWeeklyXp: number;
  readonly bestIq: number;
};

export type BadgeProgress = {
  readonly current: number;
  readonly target: number;
  readonly done: boolean;
};

function countedCategories(context: BadgeContext): number {
  return GAME_CATEGORIES.filter((category) => (context.categoryRounds[category] ?? 0) > 0).length;
}

/**
 * Koşulun ne kadarının tamamlandığı. Arayüz kilitli rozetlerde bunu
 * "7 / 30" diye gösteriyor; rozetin neden kilitli olduğunu görmek
 * kazanmaktan daha motive edici.
 */
export function badgeProgress(requirement: BadgeRequirement, context: BadgeContext): BadgeProgress {
  const of = (current: number, target: number): BadgeProgress => ({
    current: Math.min(current, target),
    target,
    done: current >= target,
  });

  switch (requirement.kind) {
    case 'level':
      return of(context.level, requirement.value);
    case 'xp':
      return of(context.xp, requirement.value);
    case 'streak':
      return of(context.longestStreak, requirement.value);
    case 'rounds':
      return of(context.totalRounds, requirement.value);
    case 'tests':
      return of(context.testsFinished, requirement.value);
    case 'category_rounds':
      return of(context.categoryRounds[requirement.category] ?? 0, requirement.value);
    case 'all_categories':
      return of(countedCategories(context), GAME_CATEGORIES.length);
    case 'axis_score':
      return of(context.brainMap[requirement.axis], requirement.value);
    case 'neuropeak':
      return of(context.neuropeak, requirement.value);
    case 'weekly_xp':
      return of(context.bestWeeklyXp, requirement.value);
    case 'best_iq':
      return of(context.bestIq, requirement.value);
    case 'league_tier':
      return of(
        LEAGUE_TIERS.indexOf(context.bestLeagueTier) + 1,
        LEAGUE_TIERS.indexOf(requirement.tier) + 1,
      );
  }
}

export function isBadgeEarned(definition: BadgeDefinition, context: BadgeContext): boolean {
  return badgeProgress(definition.requirement, context).done;
}

/** Henüz kazanılmamışken artık koşulu sağlayan rozetler. */
export function newlyEarnedBadges(
  definitions: readonly BadgeDefinition[],
  context: BadgeContext,
  earned: readonly string[],
): BadgeDefinition[] {
  const already = new Set(earned);
  return definitions.filter(
    (definition) => !already.has(definition.id) && isBadgeEarned(definition, context),
  );
}

export function starsForBadges(definitions: readonly BadgeDefinition[]): number {
  return definitions.reduce((total, definition) => total + definition.starReward, 0);
}

/**
 * Vitrin sırası: önce kazanılanlar, sonra tamamlanmaya en yakın olanlar.
 * Gizli ve kazanılmamış rozetler listeye hiç girmez.
 */
export function showcaseOrder(
  definitions: readonly BadgeDefinition[],
  context: BadgeContext,
  earned: readonly string[],
): BadgeDefinition[] {
  const already = new Set(earned);

  return definitions
    .filter((definition) => !definition.isSecret || already.has(definition.id))
    .map((definition) => ({
      definition,
      earned: already.has(definition.id),
      ratio: (() => {
        const progress = badgeProgress(definition.requirement, context);
        return progress.target === 0 ? 0 : progress.current / progress.target;
      })(),
    }))
    .sort((a, b) => {
      if (a.earned !== b.earned) return a.earned ? -1 : 1;
      if (a.earned) return a.definition.tier - b.definition.tier;
      return b.ratio - a.ratio || a.definition.tier - b.definition.tier;
    })
    .map((item) => item.definition);
}
