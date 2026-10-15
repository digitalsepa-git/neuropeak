export type ShadowToken = {
  /** React Native için gölge tanımı. */
  readonly native: {
    readonly shadowColor: string;
    readonly shadowOpacity: number;
    readonly shadowRadius: number;
    readonly shadowOffset: { readonly width: number; readonly height: number };
    readonly elevation: number;
  };
  /** Web için `box-shadow` değeri. */
  readonly css: string;
};

/**
 * Tek bir yumuşak gölge dili. Kartlar `card`, yüzen öğeler (buton, sayfa
 * üstü bar) `raised` kullanır; başka gölge tanımlanmaz.
 */
export const shadow = {
  none: {
    native: {
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0,
    },
    css: 'none',
  },
  card: {
    native: {
      shadowColor: '#15111F',
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    css: '0 4px 16px rgba(21, 17, 31, 0.08)',
  },
  raised: {
    native: {
      shadowColor: '#15111F',
      shadowOpacity: 0.14,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    css: '0 8px 24px rgba(21, 17, 31, 0.14)',
  },
} as const satisfies Record<string, ShadowToken>;

export type ShadowName = keyof typeof shadow;
