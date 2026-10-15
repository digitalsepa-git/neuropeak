/** Bir sayıyı verilen aralığa sıkıştırır. */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new RangeError(`clamp: min (${min}) max'tan (${max}) büyük olamaz`);
  }
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

/** [0, 1] aralığında doğrusal interpolasyon. */
export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * clamp(t, 0, 1);
}

/**
 * Standart normal dağılımın kümülatif dağılım fonksiyonu.
 * Test sonuçlarında yüzdelik dilim hesabı için kullanılır.
 * Abramowitz & Stegun 7.1.26 yaklaşımı, hata payı < 1.5e-7.
 */
export function standardNormalCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;

  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);

  return 0.5 * (1 + sign * y);
}
