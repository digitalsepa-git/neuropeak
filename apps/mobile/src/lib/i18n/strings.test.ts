import { describe, expect, it } from 'vitest';

import { STRINGS } from './strings';
import { translate } from './types';

const entries = Object.entries(STRINGS);

/** İki dilde de aynı kalması doğru olan metinler. */
const SAME_IN_BOTH = new Set(['common.xp', 'paywall.brand', 'paywall.generic.title']);

describe('metin kataloğu', () => {
  it('her anahtarda iki dil de var', () => {
    for (const [key, entry] of entries) {
      expect(entry, key).toHaveProperty('tr');
      expect(entry, key).toHaveProperty('en');
    }
  });

  it('düz metinler boş değil', () => {
    for (const [key, entry] of entries) {
      if (typeof entry.tr !== 'string') continue;
      expect(entry.tr.trim().length, `${key} tr`).toBeGreaterThan(0);
      expect((entry.en as string).trim().length, `${key} en`).toBeGreaterThan(0);
    }
  });

  it('bir dil şablon, diğeri düz metin değil', () => {
    // Biri fonksiyon biri dize olursa parametreler bir dilde kayboluyor.
    for (const [key, entry] of entries) {
      expect(typeof entry.tr, key).toBe(typeof entry.en);
    }
  });

  it('çevrilmemiş metin kalmamış', () => {
    for (const [key, entry] of entries) {
      if (typeof entry.tr !== 'string' || SAME_IN_BOTH.has(key)) continue;
      expect(entry.tr, `${key} iki dilde de aynı`).not.toBe(entry.en);
    }
  });

  it('şablonlar iki dilde de çalışıyor', () => {
    // Parametreler girdinin kendi tipinden geliyor; testte hepsine aynı
    // dolgu veriliyor, amaç fonksiyonun çökmeden metin üretmesi.
    const filler = new Proxy(
      {},
      {
        get: (_target, property) => (property === Symbol.toPrimitive ? () => 1 : 1),
      },
    );

    for (const [key, entry] of entries) {
      if (typeof entry.tr === 'string') continue;
      for (const language of ['tr', 'en'] as const) {
        const text = translate(STRINGS, language, key as keyof typeof STRINGS, filler);
        expect(typeof text, `${key} ${language}`).toBe('string');
        expect(text.length, `${key} ${language}`).toBeGreaterThan(0);
      }
    }
  });
});
