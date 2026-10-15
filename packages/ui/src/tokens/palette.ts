/**
 * Ham renk paleti. Ekranlarda doğrudan kullanılmaz — anlamlı isimler için
 * `theme.ts` içindeki tema renklerine başvurulur.
 */
export const palette = {
  // Marka moru
  violet50: '#F2EEFE',
  violet100: '#E2D9FD',
  violet200: '#C7B5FB',
  violet300: '#A88DF9',
  violet400: '#8D6AF8',
  violet500: '#6C3BF4',
  violet600: '#5429D6',
  violet700: '#4321A8',

  // Açık tema nötrleri
  white: '#FFFFFF',
  grey50: '#F6F5FB',
  grey100: '#ECEAF4',
  grey200: '#DCD9E8',
  grey300: '#C3BFD3',
  grey400: '#9D98AD',
  grey600: '#6F6A80',
  grey800: '#2E2940',
  grey900: '#15111F',

  // Koyu tema yüzeyleri
  ink900: '#120E20',
  ink800: '#1C1733',
  ink700: '#272047',
  ink600: '#352C5C',
  ink300: '#A8A2C4',
  ink100: '#F4F2FF',

  // Durum renkleri
  green500: '#10B981',
  green600: '#059669',
  red500: '#EF4444',
  red600: '#DC2626',
  amber500: '#F59E0B',
  blue500: '#3B82F6',

  // Kategori aksanları
  accentMemory: '#3B82F6',
  accentAttention: '#F59E0B',
  accentLogic: '#8B5CF6',
  accentMath: '#10B981',
  accentSpatial: '#EC4899',
  accentSpeed: '#EF4444',
  accentVerbal: '#14B8A6',
} as const;

export type PaletteColor = keyof typeof palette;
