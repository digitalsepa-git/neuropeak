import { clamp } from '../utils/math';
import {
  AXIS_SCORE_MAX,
  AXIS_SCORE_MIN,
  AXIS_WEIGHTS,
  BRAIN_AXES,
  type BrainAxis,
  type BrainMap,
} from '../domain/brain-axes';
import {
  GAME_CATEGORY_META,
  type Difficulty,
  type GameCategory,
  type GameMode,
} from '../domain/categories';

/**
 * Beyin haritası — oyun performansının eksen eksen özeti.
 *
 * Burada ölçülen şey zekâ değil, oyuncunun oyunlardaki son dönem
 * performansı. Her tur, ait olduğu ekseni o turun performansına doğru
 * çekiyor; ama iki yönde aynı hızda değil:
 *
 * - **Yükselirken hızlı.** İyi bir tur bir şey kanıtlıyor; harita buna
 *   çabuk uyuyor.
 * - **Düşerken yavaş.** Yarıda bırakılan ya da kötü geçen tek bir tur
 *   kazanılmış tabloyu silmemeli; ancak üst üste kötü giden bir dönem
 *   ekseni gerçekten düşürüyor.
 *
 * Simetrik bir ortalama bu oyunda yanıltıcı olurdu: oyuncu otobüste
 * on saniye oynayıp çıktığında haritası çöküyordu. Oynanmayan eksenler
 * olduğu yerde kalıyor; "unutma" simülasyonu yapmıyoruz, çünkü bunun
 * dürüst bir karşılığı yok.
 *
 * Başlangıç değeri 50: oyuncu hiçbir şey oynamadan ne iyi ne kötü
 * görünsün.
 */

export const INITIAL_AXIS_SCORE = 50;

export const EMPTY_BRAIN_MAP: BrainMap = {
  memory: INITIAL_AXIS_SCORE,
  focus: INITIAL_AXIS_SCORE,
  logic: INITIAL_AXIS_SCORE,
  speed: INITIAL_AXIS_SCORE,
  problemSolving: INITIAL_AXIS_SCORE,
};

/** İyi bir turun ekseni yukarı çekme hızı. */
export const RISE_RATE = 0.35;

/** Kötü bir turun ekseni aşağı çekme hızı; bilerek çok daha küçük. */
export const FALL_RATE = 0.08;

/**
 * Zorluk performansa çarpan olarak giriyor: zor seviyede 10. seviyeye
 * çıkmak, kolayda 10. seviyeye çıkmaktan daha iyi bir performans.
 */
const DIFFICULTY_PERFORMANCE: Readonly<Record<Difficulty, number>> = {
  easy: 0.85,
  medium: 1,
  hard: 1.25,
};

/**
 * Seviyeli oyunlarda "seviye", süreli oyunlarda "çözülen tur" sayılır.
 * Süreli oyunlarda bir turda daha çok soru çözüldüğü için ölçek daha
 * küçük; ikisi de aynı aralığa oturtuluyor.
 */
const LEVEL_SCALE: Readonly<Record<GameMode, number>> = {
  levels: 6,
  timed: 4,
};

export type RoundPerformanceInput = {
  readonly mode: GameMode;
  /** Seviyeli oyunda ulaşılan seviye, süreli oyunda tamamlanan tur. */
  readonly level: number;
  readonly completed: boolean;
  readonly difficulty: Difficulty;
};

/** Bir turu 0–100 aralığında tek bir performans değerine indirger. */
export function roundPerformance(input: RoundPerformanceInput): number {
  const raw = Math.max(0, input.level) * LEVEL_SCALE[input.mode];

  // Yarıda kalan tur da bir şey anlatır ama yarısı kadar.
  const adjusted = input.completed ? raw : raw * 0.5;

  return clamp(adjusted * DIFFICULTY_PERFORMANCE[input.difficulty], AXIS_SCORE_MIN, AXIS_SCORE_MAX);
}

export function axisForCategory(category: GameCategory): BrainAxis {
  return GAME_CATEGORY_META[category].primaryAxis;
}

/** Turu haritaya işler; yalnızca ilgili eksen değişir. */
export function applyRoundToBrainMap(
  map: BrainMap,
  category: GameCategory,
  performance: number,
): BrainMap {
  const axis = axisForCategory(category);
  const current = map[axis];
  const target = clamp(performance, AXIS_SCORE_MIN, AXIS_SCORE_MAX);
  const rate = target > current ? RISE_RATE : FALL_RATE;
  const next = current + (target - current) * rate;

  return { ...map, [axis]: Math.round(clamp(next, AXIS_SCORE_MIN, AXIS_SCORE_MAX)) };
}

/** Eksenlerin ağırlıklı ortalaması; 0–100. */
export function neuropeakScore(map: BrainMap): number {
  const total = BRAIN_AXES.reduce((sum, axis) => sum + map[axis] * AXIS_WEIGHTS[axis], 0);
  return Math.round(clamp(total, AXIS_SCORE_MIN, AXIS_SCORE_MAX));
}

/** En düşük eksen; "bugün neye çalışsam" önerisi buradan çıkıyor. */
export function weakestAxis(map: BrainMap): BrainAxis {
  return BRAIN_AXES.reduce((weakest, axis) => (map[axis] < map[weakest] ? axis : weakest));
}

export function strongestAxis(map: BrainMap): BrainAxis {
  return BRAIN_AXES.reduce((best, axis) => (map[axis] > map[best] ? axis : best));
}

/** O eksene en çok katkı yapan kategoriler; öneri kartında listeleniyor. */
export function categoriesForAxis(axis: BrainAxis): GameCategory[] {
  return (Object.keys(GAME_CATEGORY_META) as GameCategory[]).filter(
    (category) => axisForCategory(category) === axis,
  );
}
