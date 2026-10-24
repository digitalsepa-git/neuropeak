import { describe, expect, it } from 'vitest';

import { generateLogicChain, type LogicChainBank } from './logic-chain';
import {
  TUBE_CAPACITY,
  canPour,
  generateLiquidSort,
  isSolvable,
  isSolved,
  pour,
} from './liquid-sort';
import { generateMatrixPuzzle, visualKey } from './matrix';

describe('Sıvı Sıralama üreteci', () => {
  it('üretilen her bulmaca çözülebilir', () => {
    for (let level = 1; level <= 8; level += 1) {
      const puzzle = generateLiquidSort(level, level * 7919);
      expect(isSolvable(puzzle.tubes), `seviye ${level} çözülemiyor`).toBe(true);
    }
  });

  it('başlangıç durumu çözülmüş değildir', () => {
    for (let level = 1; level <= 10; level += 1) {
      expect(isSolved(generateLiquidSort(level, level * 104_729).tubes)).toBe(false);
    }
  });

  it('her rengin tam kapasite kadar sıvısı vardır', () => {
    const puzzle = generateLiquidSort(5, 42);
    const counts = new Map<number, number>();

    for (const tube of puzzle.tubes) {
      expect(tube.length).toBeLessThanOrEqual(TUBE_CAPACITY);
      for (const color of tube) {
        counts.set(color, (counts.get(color) ?? 0) + 1);
      }
    }

    expect(counts.size).toBe(puzzle.colorCount);
    for (const [, count] of counts) {
      expect(count).toBe(TUBE_CAPACITY);
    }
  });

  it('seviye yükseldikçe renk sayısı artar', () => {
    expect(generateLiquidSort(1, 1).colorCount).toBeLessThan(generateLiquidSort(12, 1).colorCount);
  });

  it('aynı tohum aynı bulmacayı verir', () => {
    expect(generateLiquidSort(4, 2026).tubes).toEqual(generateLiquidSort(4, 2026).tubes);
  });

  it('çözücü çözümsüz tahtayı reddeder', () => {
    // Boş şişe yok ve her şişe karışık: hiçbir hamle yapılamaz.
    expect(
      isSolvable([
        [0, 1, 0, 1],
        [1, 0, 1, 0],
      ]),
    ).toBe(false);

    // Bir boş şişe yeterli: aynı dağılım çözülebilir hale gelir.
    expect(isSolvable([[0, 1, 0, 1], [1, 0, 1, 0], []])).toBe(true);
  });

  it('dökme kuralları doğru çalışır', () => {
    expect(canPour([], [1])).toBe(false);
    expect(canPour([1], [])).toBe(true);
    expect(canPour([1], [2])).toBe(false);
    expect(canPour([1], [1, 1, 1, 1])).toBe(false);

    // Aynı renkten üsttekilerin hepsi birlikte akar.
    const result = pour([[2, 1, 1], []], 0, 1);
    expect(result[0]).toEqual([2]);
    expect(result[1]).toEqual([1, 1]);
  });
});

describe('Matris üreteci', () => {
  it('sekiz hücre ve dört şık üretir', () => {
    const puzzle = generateMatrixPuzzle(1, 11);

    expect(puzzle.cells).toHaveLength(8);
    expect(puzzle.options).toHaveLength(4);
  });

  it('doğru cevap her zaman şıklar arasında', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const puzzle = generateMatrixPuzzle((seed % 16) + 1, seed * 31);
      expect(puzzle.correctIndex).toBeGreaterThanOrEqual(0);
      expect(puzzle.correctIndex).toBeLessThan(puzzle.options.length);
    }
  });

  it('şıklar birbirinden farklıdır', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const puzzle = generateMatrixPuzzle((seed % 16) + 1, seed * 97);
      // Görünmeyen bir dönüş farkı iki şıkkı farklı yapmaz; oyuncu için
      // ikisi de aynı görünür.
      const keys = puzzle.options.map(visualKey);
      expect(new Set(keys).size, `tohum ${seed} tekrar eden şık üretti`).toBe(keys.length);
    }
  });

  it('aynı tohum aynı bulmacayı verir', () => {
    expect(generateMatrixPuzzle(3, 555)).toEqual(generateMatrixPuzzle(3, 555));
  });
});

/**
 * Testlerin kendi bankası. Çekirdek içerik paketine bağlı değil ve
 * olmamalı; üreteç bankayı dışarıdan aldığı için test de kendi
 * bankasını veriyor. Türkçe banka seçildi: ek alan biçimi kalıbın
 * doğru yere koyduğunu da sınıyor.
 */
const CHAIN_BANK: LogicChainBank = {
  names: [
    { subject: 'Deniz', object: "Deniz'den" },
    { subject: 'Mert', object: "Mert'ten" },
    { subject: 'Elif', object: "Elif'ten" },
    { subject: 'Burak', object: "Burak'tan" },
    { subject: 'Ayşe', object: "Ayşe'den" },
    { subject: 'Can', object: "Can'dan" },
  ],
  kinds: {
    taller: { comparative: 'daha uzun', superlative: 'en uzun', least: 'en kısa' },
    faster: { comparative: 'daha hızlı', superlative: 'en hızlı', least: 'en yavaş' },
    older: { comparative: 'daha yaşlı', superlative: 'en yaşlı', least: 'en genç' },
    heavier: { comparative: 'daha ağır', superlative: 'en ağır', least: 'en hafif' },
  },
  premise: '{a}, {b} {comparative}.',
  question: 'Kim {superlative}?',
};

describe('Mantık Zinciri üreteci', () => {
  it('zincir uzunluğu kadar kişi ve bir eksik öncül üretir', () => {
    const puzzle = generateLogicChain(1, 5, CHAIN_BANK);

    expect(puzzle.options).toHaveLength(3);
    expect(puzzle.premises).toHaveLength(2);
  });

  it('seviye yükseldikçe zincir uzar', () => {
    expect(generateLogicChain(1, 1, CHAIN_BANK).options.length).toBeLessThan(
      generateLogicChain(9, 1, CHAIN_BANK).options.length,
    );
  });

  it('doğru cevap şıklar arasında ve tek', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const puzzle = generateLogicChain((seed % 10) + 1, seed * 13, CHAIN_BANK);

      expect(puzzle.correctIndex).toBeGreaterThanOrEqual(0);
      expect(new Set(puzzle.options).size).toBe(puzzle.options.length);
    }
  });

  it('öncüller zinciri tam olarak belirler', () => {
    // Her kişi en fazla bir kez "daha" tarafında, bir kez karşı tarafta
    // geçer; bu da tam bir sıralama demektir.
    const puzzle = generateLogicChain(7, 99, CHAIN_BANK);
    const mentioned = new Set<string>();

    for (const premise of puzzle.premises) {
      for (const name of puzzle.options) {
        if (premise.includes(name)) mentioned.add(name);
      }
    }

    expect(mentioned.size).toBe(puzzle.options.length);
  });

  it('aynı tohum aynı bulmacayı verir', () => {
    expect(generateLogicChain(4, 777, CHAIN_BANK)).toEqual(generateLogicChain(4, 777, CHAIN_BANK));
  });
});
