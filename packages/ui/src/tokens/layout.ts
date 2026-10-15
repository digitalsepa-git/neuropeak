/** Dört katına dayalı boşluk skalası. Ara değer kullanılmaz. */
export const spacing = {
  xs2: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xl2: 48,
} as const;

export type SpacingToken = keyof typeof spacing;

/** Köşe yarıçapları. Yuvarlak öğeler için `pill`. */
export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radius;

/** Ekran kenar boşluğu — tüm sayfa içerikleri bu payla hizalanır. */
export const screenPadding = spacing.lg;

/** Dokunma hedefi en az bu kadar olmalı (Apple HIG: 44pt). */
export const minTouchTarget = 44;
