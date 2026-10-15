import type { BrainAxis } from './brain-axes';

/** Mini oyunların yedi kategorisi. */
export const GAME_CATEGORIES = [
  'memory',
  'attention',
  'logic',
  'math',
  'spatial',
  'speed',
  'verbal',
] as const;

export type GameCategory = (typeof GAME_CATEGORIES)[number];

export type GameCategoryMeta = {
  /** Kategorinin kimliği; veritabanı ve çeviri anahtarlarında kullanılır. */
  readonly id: GameCategory;
  /** Bu kategorideki oyunların öncelikli olarak beslediği beyin haritası ekseni. */
  readonly primaryAxis: BrainAxis;
};

/** Görsel karşılıkları (aksan renkleri) @neuropeak/ui içindeki `categoryAccent`tedir. */
export const GAME_CATEGORY_META: Readonly<Record<GameCategory, GameCategoryMeta>> = {
  memory: { id: 'memory', primaryAxis: 'memory' },
  attention: { id: 'attention', primaryAxis: 'focus' },
  logic: { id: 'logic', primaryAxis: 'logic' },
  math: { id: 'math', primaryAxis: 'problemSolving' },
  spatial: { id: 'spatial', primaryAxis: 'logic' },
  speed: { id: 'speed', primaryAxis: 'speed' },
  verbal: { id: 'verbal', primaryAxis: 'problemSolving' },
};

/** Bir oyunun ilerleme yapısı: seviyeli liste mi, süreli skor modu mu. */
export type GameMode = 'levels' | 'timed';

/** Oyun öncesi seçilen zorluk ve kazanılan XP'ye uygulanan çarpanı. */
export const DIFFICULTY_MULTIPLIERS = {
  easy: 1,
  medium: 1.25,
  hard: 2.25,
} as const;

export type Difficulty = keyof typeof DIFFICULTY_MULTIPLIERS;
