import type { GameCategory } from '@neuropeak/core';

import { palette } from './tokens/palette';

export type ThemeName = 'light' | 'dark';

export type ThemeColors = {
  /** Ekran zemini. */
  readonly background: string;
  /** Kart ve panel yüzeyi. */
  readonly surface: string;
  /** Yüzey üstündeki ikinci katman (seçili satır, iç kart). */
  readonly surfaceElevated: string;
  /** Zeminden daha içeri çekilmiş alan (ilerleme çubuğu yatağı, input). */
  readonly surfaceSunken: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textMuted: string;
  readonly border: string;
  readonly brand: string;
  readonly brandStrong: string;
  /** Marka rengi üzerindeki metin/ikon. */
  readonly onBrand: string;
  readonly success: string;
  readonly danger: string;
  readonly warning: string;
  readonly info: string;
  /** Modal arkası karartma. */
  readonly overlay: string;
};

export type Theme = {
  readonly name: ThemeName;
  readonly colors: ThemeColors;
};

/** Menü, test ve profil ekranlarının teması. */
export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: palette.grey50,
    surface: palette.white,
    surfaceElevated: palette.white,
    surfaceSunken: palette.grey100,
    textPrimary: palette.grey900,
    textSecondary: palette.grey600,
    textMuted: palette.grey400,
    border: palette.grey100,
    brand: palette.violet500,
    brandStrong: palette.violet600,
    onBrand: palette.white,
    success: palette.green600,
    danger: palette.red600,
    warning: palette.amber500,
    info: palette.blue500,
    overlay: 'rgba(21, 17, 31, 0.45)',
  },
};

/** Oyun ekranlarının teması — odak için koyu ve düşük kontrastlı yüzeyler. */
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: palette.ink900,
    surface: palette.ink800,
    surfaceElevated: palette.ink700,
    surfaceSunken: palette.ink600,
    textPrimary: palette.ink100,
    textSecondary: palette.ink300,
    textMuted: palette.grey400,
    border: palette.ink600,
    // Koyu zeminde violet500 yeterince ayrışmıyor, bir ton açılıyor.
    brand: palette.violet400,
    brandStrong: palette.violet300,
    onBrand: palette.ink900,
    success: palette.green500,
    danger: palette.red500,
    warning: palette.amber500,
    info: palette.blue500,
    overlay: 'rgba(5, 3, 12, 0.6)',
  },
};

export const themes: Readonly<Record<ThemeName, Theme>> = {
  light: lightTheme,
  dark: darkTheme,
};

/**
 * Oyun kategorilerinin aksan renkleri. Kategori kimlikleri alan modelinde
 * (@neuropeak/core), görsel karşılıkları burada durur.
 */
export const categoryAccent: Readonly<Record<GameCategory, string>> = {
  memory: palette.accentMemory,
  attention: palette.accentAttention,
  logic: palette.accentLogic,
  math: palette.accentMath,
  spatial: palette.accentSpatial,
  speed: palette.accentSpeed,
  verbal: palette.accentVerbal,
};
