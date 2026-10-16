import { describe, expect, it } from 'vitest';

import { toTurkishUpper, turkishDativeSuffix } from './turkish';

describe('toTurkishUpper', () => {
  it('noktalı i harfini korur', () => {
    expect(toTurkishUpper('iplik')).toBe('İPLİK');
    expect(toTurkishUpper('ışık')).toBe('IŞIK');
  });

  it('Türkçeye özgü harfleri büyütür', () => {
    expect(toTurkishUpper('çiğdem')).toBe('ÇİĞDEM');
    expect(toTurkishUpper('gözlükçü')).toBe('GÖZLÜKÇÜ');
  });

  it('zaten büyük harfleri değiştirmez', () => {
    expect(toTurkishUpper('ABC')).toBe('ABC');
  });
});

describe('turkishDativeSuffix', () => {
  it('birler basamağının okunuşunu izler', () => {
    expect(turkishDativeSuffix(1)).toBe("'e");
    expect(turkishDativeSuffix(2)).toBe("'ye");
    expect(turkishDativeSuffix(3)).toBe("'e");
    expect(turkishDativeSuffix(6)).toBe("'ya");
    expect(turkishDativeSuffix(7)).toBe("'ye");
    expect(turkishDativeSuffix(9)).toBe("'a");
  });

  it('sıfırla biten sayılarda onlar basamağına bakar', () => {
    expect(turkishDativeSuffix(10)).toBe("'a");
    expect(turkishDativeSuffix(20)).toBe("'ye");
    expect(turkishDativeSuffix(40)).toBe("'a");
    expect(turkishDativeSuffix(50)).toBe("'ye");
    expect(turkishDativeSuffix(70)).toBe("'e");
  });

  it('iki basamaklı sayıda yine son rakam belirler', () => {
    expect(turkishDativeSuffix(12)).toBe("'ye");
    expect(turkishDativeSuffix(26)).toBe("'ya");
    expect(turkishDativeSuffix(99)).toBe("'a");
  });

  it('yüz ve bin ile biten sayılar "e" alır', () => {
    expect(turkishDativeSuffix(100)).toBe("'e");
    expect(turkishDativeSuffix(300)).toBe("'e");
    expect(turkishDativeSuffix(1000)).toBe("'e");
  });

  it('her sayı için bir ek üretir', () => {
    for (let value = 1; value <= 500; value += 1) {
      expect(turkishDativeSuffix(value), `${value}`).toMatch(/^'(e|a|ye|ya)$/);
    }
  });
});
