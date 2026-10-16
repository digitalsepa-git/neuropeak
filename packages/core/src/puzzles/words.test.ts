import { describe, expect, it } from 'vitest';

import {
  anagramLengthForLevel,
  generateAnagram,
  generateWordAnalogy,
  generateWordPair,
  type AnagramEntry,
  type AnalogyEntry,
  type WordPairEntry,
} from './words';

const ANAGRAMS: readonly AnagramEntry[] = [
  { word: 'elma', clue: 'meyve' },
  { word: 'ayna', clue: 'cam' },
  { word: 'kitap', clue: 'okunur' },
  { word: 'bulut', clue: 'gökyüzü' },
  { word: 'yıldız', clue: 'gece' },
  { word: 'pencere', clue: 'duvarda' },
  { word: 'merdiven', clue: 'basamak' },
];

const ANALOGIES: readonly AnalogyEntry[] = [
  {
    id: 'a1',
    left: ['kuş', 'kanat'],
    right: 'balık',
    answer: 'yüzgeç',
    distractors: ['tüy', 'gaga', 'boynuz'],
    relation: 'hareket organı',
    level: 1,
  },
  {
    id: 'a2',
    left: ['saat', 'zaman'],
    right: 'terazi',
    answer: 'ağırlık',
    distractors: ['uzunluk', 'sıcaklık', 'hız'],
    relation: 'ölçü aleti',
    level: 3,
  },
  {
    id: 'a3',
    left: ['tortu', 'sıvı'],
    right: 'kül',
    answer: 'ateş',
    distractors: ['duman', 'alev', 'kor'],
    relation: 'geriye kalan',
    level: 5,
  },
];

const PAIRS: readonly WordPairEntry[] = [
  {
    id: 'p1',
    word: 'siyah',
    mode: 'synonym',
    answer: 'kara',
    distractors: ['beyaz', 'mavi', 'gri'],
  },
  {
    id: 'p2',
    word: 'cesur',
    mode: 'antonym',
    answer: 'korkak',
    distractors: ['yiğit', 'atak', 'güçlü'],
  },
];

describe('anagramLengthForLevel', () => {
  it('dört harften başlar', () => {
    expect(anagramLengthForLevel(1)).toBe(4);
    expect(anagramLengthForLevel(3)).toBe(4);
  });

  it('üç seviyede bir uzar', () => {
    expect(anagramLengthForLevel(4)).toBe(5);
    expect(anagramLengthForLevel(7)).toBe(6);
  });

  it('sekiz harfte durur', () => {
    expect(anagramLengthForLevel(50)).toBe(8);
  });
});

describe('Kelime Avı üreteci', () => {
  it('karıştırılmış harfler kelimenin permütasyonu', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const puzzle = generateAnagram(ANAGRAMS, (seed % 20) + 1, seed * 13);
      const sorted = (value: readonly string[]) => [...value].sort().join('');

      expect(sorted(puzzle.letters), `tohum ${seed}`).toBe(sorted([...puzzle.word]));
    }
  });

  it('karıştırma kelimenin kendisine eşit olmaz', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const puzzle = generateAnagram(ANAGRAMS, (seed % 20) + 1, seed * 29);

      expect(puzzle.letters.join(''), `tohum ${seed} karıştırmadı`).not.toBe(puzzle.word);
    }
  });

  it('seviye yükseldikçe daha uzun kelime seçer', () => {
    const short = generateAnagram(ANAGRAMS, 1, 7);
    const long = generateAnagram(ANAGRAMS, 20, 7);

    expect(long.word.length).toBeGreaterThan(short.word.length);
  });

  it('bankada o uzunlukta kelime yoksa en yakınına düşer', () => {
    const onlyLong: readonly AnagramEntry[] = [{ word: 'merdiven', clue: 'basamak' }];

    expect(generateAnagram(onlyLong, 1, 5).word).toBe('merdiven');
  });

  it('her kelimenin ipucu taşınır', () => {
    const puzzle = generateAnagram(ANAGRAMS, 1, 11);
    const entry = ANAGRAMS.find((item) => item.word === puzzle.word);

    expect(puzzle.clue).toBe(entry?.clue);
  });

  it('aynı tohum aynı bulmacayı verir', () => {
    expect(generateAnagram(ANAGRAMS, 5, 2026)).toEqual(generateAnagram(ANAGRAMS, 5, 2026));
  });

  it('bir önceki kelimeyi tekrar sormaz', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const first = generateAnagram(ANAGRAMS, 1, seed * 37);
      const second = generateAnagram(ANAGRAMS, 1, seed * 37 + 1, first.word);

      expect(second.word, `tohum ${seed}`).not.toBe(first.word);
    }
  });

  it('o uzunlukta tek kelime varsa tekrar sormak zorunda kalır', () => {
    const only: readonly AnagramEntry[] = [{ word: 'merdiven', clue: 'basamak' }];

    expect(generateAnagram(only, 20, 3, 'merdiven').word).toBe('merdiven');
  });

  it('boş banka hata verir', () => {
    expect(() => generateAnagram([], 1, 1)).toThrow(RangeError);
  });
});

describe('Sözel Analoji üreteci', () => {
  it('doğru cevap şıklar arasında ve şıklar farklı', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const puzzle = generateWordAnalogy(ANALOGIES, (seed % 15) + 1, seed * 17);

      expect(puzzle.options).toHaveLength(4);
      expect(new Set(puzzle.options).size, `tohum ${seed}`).toBe(4);
      expect(puzzle.correctIndex).toBeGreaterThanOrEqual(0);

      const entry = ANALOGIES.find((item) => item.right === puzzle.right);
      expect(puzzle.options[puzzle.correctIndex]).toBe(entry?.answer);
    }
  });

  it('düşük seviye kolay, yüksek seviye zor soru seçer', () => {
    expect(generateWordAnalogy(ANALOGIES, 1, 3).relation).toBe('hareket organı');
    expect(generateWordAnalogy(ANALOGIES, 15, 3).relation).toBe('geriye kalan');
  });

  it('aynı tohum aynı bulmacayı verir', () => {
    expect(generateWordAnalogy(ANALOGIES, 4, 99)).toEqual(generateWordAnalogy(ANALOGIES, 4, 99));
  });

  it('kademede başka soru varsa öncekini tekrarlamaz', () => {
    const sameLevel: readonly AnalogyEntry[] = [
      { ...(ANALOGIES[0] as AnalogyEntry), id: 'x1' },
      { ...(ANALOGIES[0] as AnalogyEntry), id: 'x2', answer: 'pervane' },
    ];

    for (let seed = 1; seed <= 100; seed += 1) {
      const first = generateWordAnalogy(sameLevel, 1, seed * 11);
      const second = generateWordAnalogy(sameLevel, 1, seed * 11 + 1, first.id);

      expect(second.id, `tohum ${seed}`).not.toBe(first.id);
    }
  });

  it('kademede tek soru varsa tekrar sormak zorunda kalır', () => {
    const puzzle = generateWordAnalogy(ANALOGIES, 1, 5, 'a1');
    expect(puzzle.id).toBe('a1');
  });

  it('boş banka hata verir', () => {
    expect(() => generateWordAnalogy([], 1, 1)).toThrow(RangeError);
  });
});

describe('Kelime Bağı üreteci', () => {
  it('doğru cevap şıklar arasında ve şıklar farklı', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const puzzle = generateWordPair(PAIRS, seed * 23);

      expect(puzzle.options).toHaveLength(4);
      expect(new Set(puzzle.options).size).toBe(4);

      const entry = PAIRS.find((item) => item.word === puzzle.word);
      expect(puzzle.options[puzzle.correctIndex]).toBe(entry?.answer);
      expect(puzzle.mode).toBe(entry?.mode);
    }
  });

  it('bankadaki her soruyu er geç sorar', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 100; seed += 1) {
      seen.add(generateWordPair(PAIRS, seed * 31).word);
    }

    expect(seen.size).toBe(PAIRS.length);
  });

  it('bir önceki soruyu tekrarlamaz', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const first = generateWordPair(PAIRS, seed * 19);
      const second = generateWordPair(PAIRS, seed * 19 + 1, first.id);

      expect(second.id, `tohum ${seed}`).not.toBe(first.id);
    }
  });

  it('boş banka hata verir', () => {
    expect(() => generateWordPair([], 1)).toThrow(RangeError);
  });
});
