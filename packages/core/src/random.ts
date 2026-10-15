/**
 * Tohumlanabilir rastgelelik. Aynı tohum her cihazda aynı diziyi üretir;
 * test soruları ve prosedürel oyun seviyeleri bu sayede tekrarlanabilir.
 */

export type Rng = () => number;

/** mulberry32 — küçük, hızlı ve bu iş için yeterince düzgün dağılımlı. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Metinden tohum üretir; oturum kimliği gibi dizeleri tohuma çevirmek için. */
export function seedFromString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Fisher–Yates; girdiyi değiştirmez. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(rng() * (index + 1));
    const current = result[index] as T;
    result[index] = result[swapWith] as T;
    result[swapWith] = current;
  }
  return result;
}

/** Karıştırıp ilk `count` öğeyi alır. */
export function sample<T>(items: readonly T[], count: number, rng: Rng): T[] {
  return shuffle(items, rng).slice(0, Math.max(0, Math.min(count, items.length)));
}
