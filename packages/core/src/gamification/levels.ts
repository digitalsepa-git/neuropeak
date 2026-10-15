/**
 * Seviye eğrisi.
 *
 * Her seviye bir öncekinden biraz daha uzun sürer ama fark giderek
 * yumuşar: ilk seviyeler birkaç oyunla geçilir, üst seviyeler bir hedef
 * olarak kalır. Kullanılan biçim: n. seviyeye geçmek için 60 × (n−1)^1.45 XP.
 */

export const MAX_LEVEL = 100;

const BASE_XP = 60;
const CURVE_EXPONENT = 1.45;

/** Verilen seviyeye ulaşmak için gereken toplam XP. */
export function totalXpForLevel(level: number): number {
  if (level <= 1) return 0;
  const capped = Math.min(level, MAX_LEVEL);
  return Math.round(BASE_XP * (capped - 1) ** CURVE_EXPONENT);
}

/** Toplam XP'nin karşılık geldiği seviye. */
export function levelForXp(xp: number): number {
  if (xp <= 0) return 1;

  // Eğri monoton, ikili arama yeterli ve sabit zamanlı sayılır.
  let low = 1;
  let high = MAX_LEVEL;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (totalXpForLevel(middle) <= xp) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  return low;
}

export type LevelProgress = {
  readonly level: number;
  /** Bu seviyede kazanılmış XP. */
  readonly xpIntoLevel: number;
  /** Bir sonraki seviyeye geçmek için gereken toplam XP. */
  readonly xpForNextLevel: number;
  /** 0 ile 1 arasında ilerleme; son seviyede 1. */
  readonly ratio: number;
  readonly isMaxLevel: boolean;
};

export function levelProgress(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const isMaxLevel = level >= MAX_LEVEL;

  if (isMaxLevel) {
    return { level: MAX_LEVEL, xpIntoLevel: 0, xpForNextLevel: 0, ratio: 1, isMaxLevel: true };
  }

  const current = totalXpForLevel(level);
  const next = totalXpForLevel(level + 1);
  const span = next - current;
  const into = Math.max(0, xp - current);

  return {
    level,
    xpIntoLevel: into,
    xpForNextLevel: span,
    ratio: span === 0 ? 1 : Math.min(1, into / span),
    isMaxLevel: false,
  };
}
