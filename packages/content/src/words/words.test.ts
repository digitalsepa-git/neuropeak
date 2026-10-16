import { describe, expect, it } from 'vitest';

import { TR_ANAGRAMS, TR_ANALOGIES, TR_WORD_PAIRS } from './tr';

/**
 * Banka içeriğinin oyun kurallarına uyduğunu doğrular. Üreteçlerin
 * kendi testleri `@neuropeak/core`'da; burada denetlenen şey kelimelerin
 * kendisi — elle yazılan içerikte en kolay kaçan hatalar tekrar eden
 * şık, yanlış uzunluk ve eksik ipucu.
 */

const TURKISH_LOWER = /^[a-zçğıöşü ]+$/;

describe('Kelime Avı bankası', () => {
  it('kelimeler benzersiz', () => {
    const words = TR_ANAGRAMS.map((entry) => entry.word);
    expect(new Set(words).size).toBe(words.length);
  });

  it('kelimeler küçük harfli ve Türkçe karakterli', () => {
    for (const entry of TR_ANAGRAMS) {
      expect(entry.word, `${entry.word} beklenmeyen karakter içeriyor`).toMatch(TURKISH_LOWER);
    }
  });

  it('her kelimenin ipucu var', () => {
    for (const entry of TR_ANAGRAMS) {
      expect(entry.clue.length, `${entry.word} ipucusuz`).toBeGreaterThan(5);
    }
  });

  it('ipucu kelimenin kendisini ele vermiyor', () => {
    for (const entry of TR_ANAGRAMS) {
      expect(entry.clue.toLowerCase(), `${entry.word} ipucunda geçiyor`).not.toContain(entry.word);
    }
  });

  it('dörtten sekize her uzunlukta en az dört kelime var', () => {
    for (let length = 4; length <= 8; length += 1) {
      const count = TR_ANAGRAMS.filter((entry) => entry.word.length === length).length;
      expect(count, `${length} harfli kelime sayısı`).toBeGreaterThanOrEqual(4);
    }
  });

  it('bütün harfleri aynı olan kelime yok', () => {
    // Böyle bir kelime karıştırılamaz, oyuncuya iş kalmaz.
    for (const entry of TR_ANAGRAMS) {
      expect(new Set(entry.word).size, `${entry.word} karıştırılamaz`).toBeGreaterThan(1);
    }
  });
});

describe('Sözel Analoji bankası', () => {
  it('kimlikler benzersiz', () => {
    const ids = TR_ANALOGIES.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('doğru cevap çeldiricilerle çakışmıyor', () => {
    for (const entry of TR_ANALOGIES) {
      const options = [entry.answer, ...entry.distractors];
      expect(new Set(options).size, `${entry.id} şıkları tekrar ediyor`).toBe(4);
    }
  });

  it('cevap soruda geçen kelimelerden biri değil', () => {
    for (const entry of TR_ANALOGIES) {
      const asked = [entry.left[0], entry.left[1], entry.right];
      expect(asked, `${entry.id} cevabı soruda geçiyor`).not.toContain(entry.answer);
    }
  });

  it('her kademede en az dört soru var', () => {
    for (let level = 1; level <= 5; level += 1) {
      const count = TR_ANALOGIES.filter((entry) => entry.level === level).length;
      expect(count, `${level}. kademe soru sayısı`).toBeGreaterThanOrEqual(4);
    }
  });

  it('her sorunun ilişki adı yazılı', () => {
    for (const entry of TR_ANALOGIES) {
      expect(entry.relation.length, `${entry.id} ilişkisiz`).toBeGreaterThan(3);
    }
  });
});

describe('Kelime Bağı bankası', () => {
  it('kimlikler benzersiz', () => {
    const ids = TR_WORD_PAIRS.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('doğru cevap çeldiricilerle çakışmıyor', () => {
    for (const entry of TR_WORD_PAIRS) {
      const options = [entry.answer, ...entry.distractors];
      expect(new Set(options).size, `${entry.id} şıkları tekrar ediyor`).toBe(4);
    }
  });

  it('cevap sorulan kelimenin kendisi değil', () => {
    for (const entry of TR_WORD_PAIRS) {
      expect(entry.answer, `${entry.id} kendini cevaplıyor`).not.toBe(entry.word);
      expect(entry.distractors, `${entry.id} çeldiricisi soruyu tekrar ediyor`).not.toContain(
        entry.word,
      );
    }
  });

  it('eş ve zıt anlam soruları dengeli', () => {
    const synonyms = TR_WORD_PAIRS.filter((entry) => entry.mode === 'synonym').length;
    const antonyms = TR_WORD_PAIRS.length - synonyms;

    expect(synonyms).toBeGreaterThanOrEqual(10);
    expect(antonyms).toBeGreaterThanOrEqual(10);
  });

  it('kelimeler bankada bir kez soruluyor', () => {
    const words = TR_WORD_PAIRS.map((entry) => `${entry.mode}:${entry.word}`);
    expect(new Set(words).size).toBe(words.length);
  });
});
