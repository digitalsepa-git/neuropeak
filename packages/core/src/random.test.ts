import { describe, expect, it } from 'vitest';

import { createRng, sample, seedFromString, shuffle } from './random';

describe('createRng', () => {
  it('aynı tohum aynı diziyi verir', () => {
    const first = Array.from({ length: 5 }, createRng(42));
    const rng = createRng(42);
    const second = Array.from({ length: 5 }, () => rng());

    expect(Array.from({ length: 5 }, createRng(42))).toEqual(first);
    expect(second).toEqual(first);
  });

  it('farklı tohum farklı dizi verir', () => {
    const a = createRng(1);
    const b = createRng(2);

    expect(a()).not.toBe(b());
  });

  it('[0, 1) aralığında kalır', () => {
    const rng = createRng(7);
    for (let index = 0; index < 500; index += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('seedFromString', () => {
  it('aynı metin aynı tohumu verir', () => {
    expect(seedFromString('oturum-1')).toBe(seedFromString('oturum-1'));
    expect(seedFromString('oturum-1')).not.toBe(seedFromString('oturum-2'));
  });
});

describe('shuffle', () => {
  it('girdiyi değiştirmez ve tüm öğeleri korur', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input, createRng(3));

    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('aynı tohumla aynı sırayı verir', () => {
    const input = ['a', 'b', 'c', 'd', 'e', 'f'];

    expect(shuffle(input, createRng(9))).toEqual(shuffle(input, createRng(9)));
  });
});

describe('sample', () => {
  it('istenen sayıda benzersiz öğe döndürür', () => {
    const input = Array.from({ length: 30 }, (_, index) => index);
    const result = sample(input, 20, createRng(11));

    expect(result).toHaveLength(20);
    expect(new Set(result).size).toBe(20);
  });

  it('istenen sayı girdiden büyükse hepsini döndürür', () => {
    expect(sample([1, 2], 10, createRng(1))).toHaveLength(2);
  });

  it('sıfır ve negatif için boş döndürür', () => {
    expect(sample([1, 2, 3], 0, createRng(1))).toEqual([]);
    expect(sample([1, 2, 3], -5, createRng(1))).toEqual([]);
  });
});
