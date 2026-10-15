/**
 * Beyin haritasının beş ekseni. Her oyun ve test sonucu bu eksenlerden
 * bir veya birkaçını besler; eksenlerin ağırlıklı ortalaması NeuroPeak skorunu verir.
 */
export const BRAIN_AXES = ['memory', 'focus', 'logic', 'speed', 'problemSolving'] as const;

export type BrainAxis = (typeof BRAIN_AXES)[number];

/** Bir eksenin puanı her zaman bu aralıkta tutulur. */
export const AXIS_SCORE_MIN = 0;
export const AXIS_SCORE_MAX = 100;

/**
 * NeuroPeak skoru hesaplanırken eksenlerin ağırlıkları.
 * Toplamı 1.0 olmalıdır.
 */
export const AXIS_WEIGHTS: Readonly<Record<BrainAxis, number>> = {
  memory: 0.22,
  focus: 0.2,
  logic: 0.24,
  speed: 0.14,
  problemSolving: 0.2,
};

/** Bir kullanıcının beş eksendeki anlık puanları. */
export type BrainMap = Record<BrainAxis, number>;
