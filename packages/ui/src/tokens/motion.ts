/** Geçiş süreleri (ms). */
export const duration = {
  instant: 100,
  fast: 160,
  base: 240,
  slow: 400,
} as const;

export type DurationToken = keyof typeof duration;

/** Reanimated `withSpring` yapılandırmaları. */
export const spring = {
  /** Yumuşak giriş-çıkış: kart açılması, sayfa geçişi. */
  gentle: { damping: 20, stiffness: 180, mass: 1 },
  /** Hızlı geri bildirim: buton basılması, çip seçimi. */
  snappy: { damping: 26, stiffness: 420, mass: 0.7 },
  /** Kutlama: seviye atlama, rozet kazanma. */
  bouncy: { damping: 12, stiffness: 260, mass: 0.9 },
} as const;

export type SpringToken = keyof typeof spring;

/** Basılabilir öğelerin basılı haldeki ölçeği. */
export const pressedScale = 0.96;
