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
  /** Tasarım sistemindeki aksan rengi (hex). */
  readonly accentColor: string;
  /** Bu kategorideki oyunların öncelikli olarak beslediği beyin haritası ekseni. */
  readonly primaryAxis: BrainAxis;
};

export const GAME_CATEGORY_META: Readonly<Record<GameCategory, GameCategoryMeta>> = {
  memory: { id: 'memory', accentColor: '#3B82F6', primaryAxis: 'memory' },
  attention: { id: 'attention', accentColor: '#F59E0B', primaryAxis: 'focus' },
  logic: { id: 'logic', accentColor: '#8B5CF6', primaryAxis: 'logic' },
  math: { id: 'math', accentColor: '#10B981', primaryAxis: 'problemSolving' },
  spatial: { id: 'spatial', accentColor: '#EC4899', primaryAxis: 'logic' },
  speed: { id: 'speed', accentColor: '#EF4444', primaryAxis: 'speed' },
  verbal: { id: 'verbal', accentColor: '#14B8A6', primaryAxis: 'problemSolving' },
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
