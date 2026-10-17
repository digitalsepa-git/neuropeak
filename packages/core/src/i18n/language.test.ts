import { describe, expect, it } from 'vitest';

import { parseLanguage, pickLocalized, resolveLanguage } from './language';

describe('dil seçimi', () => {
  it('cihaz Türkçeyse Türkçe', () => {
    expect(resolveLanguage(['tr-TR'])).toBe('tr');
    expect(resolveLanguage(['tr'])).toBe('tr');
    expect(resolveLanguage(['tr_TR'])).toBe('tr');
    expect(resolveLanguage(['TR-tr'])).toBe('tr');
  });

  it('başka dillerde İngilizce', () => {
    expect(resolveLanguage(['de-DE'])).toBe('en');
    expect(resolveLanguage(['en-US'])).toBe('en');
    expect(resolveLanguage([])).toBe('en');
    expect(resolveLanguage([null, undefined])).toBe('en');
  });

  it('listede Türkçe varsa sıradan önce gelen dil kazanır', () => {
    expect(resolveLanguage(['de-DE', 'tr-TR'])).toBe('tr');
  });

  it('türkmence Türkçe sayılmaz', () => {
    // "tk" ile başlayan etiketler değil, yalnızca tam "tr" ailesi.
    expect(resolveLanguage(['tk-TM'])).toBe('en');
    expect(resolveLanguage(['tri'])).toBe('en');
  });
});

describe('depolanmış dil', () => {
  it('tanınan değerler geçer', () => {
    expect(parseLanguage('tr')).toBe('tr');
    expect(parseLanguage('en')).toBe('en');
  });

  it('tanınmayan değer yoksayılır', () => {
    expect(parseLanguage('de')).toBeUndefined();
    expect(parseLanguage(null)).toBeUndefined();
    expect(parseLanguage(42)).toBeUndefined();
  });
});

describe('yerelleştirilmiş metin', () => {
  it('dile göre seçilir', () => {
    const value = { tr: 'Merhaba', en: 'Hello' };
    expect(pickLocalized(value, 'tr')).toBe('Merhaba');
    expect(pickLocalized(value, 'en')).toBe('Hello');
  });
});
