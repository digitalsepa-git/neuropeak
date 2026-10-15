import { describe, expect, it } from 'vitest';

import { clamp, lerp, standardNormalCdf } from './math';

describe('clamp', () => {
  it('aralık içindeki değeri olduğu gibi döndürür', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('alt ve üst sınırları uygular', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });

  it('NaN için alt sınırı döndürür', () => {
    expect(clamp(Number.NaN, 55, 145)).toBe(55);
  });

  it('min > max olduğunda hata fırlatır', () => {
    expect(() => clamp(1, 10, 0)).toThrow(RangeError);
  });
});

describe('lerp', () => {
  it('uç noktaları döndürür', () => {
    expect(lerp(0, 100, 0)).toBe(0);
    expect(lerp(0, 100, 1)).toBe(100);
  });

  it('ara değeri hesaplar', () => {
    expect(lerp(0, 100, 0.25)).toBe(25);
  });

  it('t değerini [0, 1] aralığına sıkıştırır', () => {
    expect(lerp(0, 100, 2)).toBe(100);
    expect(lerp(0, 100, -1)).toBe(0);
  });
});

describe('standardNormalCdf', () => {
  it('ortalamada 0.5 verir', () => {
    expect(standardNormalCdf(0)).toBeCloseTo(0.5, 6);
  });

  it('bilinen z değerlerini doğru hesaplar', () => {
    // IQ 115 → z = 1 → ~%84 yüzdelik dilim
    expect(standardNormalCdf(1)).toBeCloseTo(0.8413, 4);
    // IQ 85 → z = -1 → ~%16 yüzdelik dilim
    expect(standardNormalCdf(-1)).toBeCloseTo(0.1587, 4);
    expect(standardNormalCdf(1.96)).toBeCloseTo(0.975, 4);
  });

  it('simetriktir', () => {
    expect(standardNormalCdf(1.3) + standardNormalCdf(-1.3)).toBeCloseTo(1, 6);
  });
});
