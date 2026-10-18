import { describe, expect, it } from 'vitest';

import {
  BRAIN_AGE_MAX,
  BRAIN_AGE_MIN,
  MEANINGFUL_SPREAD,
  brainAge,
  focusScore,
  measureSpread,
  median,
  memoryScore,
  overallScore,
  rankMeasures,
  reactionScore,
  speedScore,
  type BrainAgeScores,
} from './brain-age';

const PERFECT: BrainAgeScores = { reaction: 1, memory: 1, speed: 1, focus: 1 };
const ZERO: BrainAgeScores = { reaction: 0, memory: 0, speed: 0, focus: 0 };

describe('ölçüm puanları', () => {
  it('tepki süresi: hızlı tam puan, yavaş sıfır', () => {
    expect(reactionScore(200)).toBe(1);
    expect(reactionScore(220)).toBe(1);
    expect(reactionScore(600)).toBe(0);
    expect(reactionScore(900)).toBe(0);
    expect(reactionScore(410)).toBeCloseTo(0.5, 1);
  });

  it('hane menzili', () => {
    expect(memoryScore(9)).toBe(1);
    expect(memoryScore(4)).toBe(0);
    expect(memoryScore(3)).toBe(0);
    expect(memoryScore(6.5)).toBeCloseTo(0.5, 2);
  });

  it('işlem hızı', () => {
    expect(speedScore(40)).toBe(1);
    expect(speedScore(10)).toBe(0);
    expect(speedScore(25)).toBeCloseTo(0.5, 2);
  });

  it('dürtü kontrolü', () => {
    expect(focusScore(1)).toBe(1);
    expect(focusScore(0.6)).toBe(0);
    expect(focusScore(0.8)).toBeCloseTo(0.5, 2);
  });

  it('bozuk ölçüm çökertmez', () => {
    expect(reactionScore(Number.NaN)).toBe(0);
    expect(memoryScore(-3)).toBe(0);
    expect(speedScore(1000)).toBe(1);
  });
});

describe('beyin yaşı', () => {
  it('ölçeğin uçlarında kalıyor', () => {
    expect(brainAge(PERFECT)).toBe(BRAIN_AGE_MIN);
    expect(brainAge(ZERO)).toBe(BRAIN_AGE_MAX);
  });

  it('daha iyi ölçüm daha düşük yaş verir', () => {
    const better: BrainAgeScores = { reaction: 0.8, memory: 0.6, speed: 0.7, focus: 0.9 };
    const worse: BrainAgeScores = { reaction: 0.3, memory: 0.4, speed: 0.2, focus: 0.5 };
    expect(brainAge(better)).toBeLessThan(brainAge(worse));
  });

  it('tek bir ölçüm sonucu tek başına belirlemiyor', () => {
    // Tepkisi mükemmel ama kalanı sıfır olan biri en genç çıkmamalı.
    const onlyReaction: BrainAgeScores = { reaction: 1, memory: 0, speed: 0, focus: 0 };
    expect(brainAge(onlyReaction)).toBeGreaterThan(BRAIN_AGE_MIN + 20);
  });

  it('ağırlıklar toplam puana yansıyor', () => {
    // Tepki (0.30) dürtü kontrolünden (0.15) ağır.
    const reactionOnly: BrainAgeScores = { ...ZERO, reaction: 1 };
    const focusOnly: BrainAgeScores = { ...ZERO, focus: 1 };
    expect(overallScore(reactionOnly)).toBeGreaterThan(overallScore(focusOnly));
  });
});

describe('ölçüm farkı', () => {
  it('dördü de aynıyken fark yok', () => {
    expect(measureSpread(PERFECT)).toBe(0);
    expect(measureSpread(ZERO)).toBe(0);
  });

  it('en yüksekle en düşük arasındaki fark', () => {
    expect(measureSpread({ reaction: 0.9, memory: 0.2, speed: 0.5, focus: 0.4 })).toBeCloseTo(
      0.7,
      5,
    );
  });

  it('anlamlı fark eşiği makul', () => {
    expect(MEANINGFUL_SPREAD).toBeGreaterThan(0);
    expect(MEANINGFUL_SPREAD).toBeLessThan(0.2);
  });
});

describe('ölçüm sıralaması', () => {
  it('en güçlüden en zayıfa', () => {
    const scores: BrainAgeScores = { reaction: 0.2, memory: 0.9, speed: 0.5, focus: 0.1 };
    expect(rankMeasures(scores)).toEqual(['memory', 'speed', 'reaction', 'focus']);
  });

  it('eşitlikte sıra sabit', () => {
    expect(rankMeasures(PERFECT)).toEqual(['reaction', 'memory', 'speed', 'focus']);
  });
});

describe('ortanca', () => {
  it('tek sayıda ölçümde ortadaki', () => {
    expect(median([300, 280, 350])).toBe(300);
  });

  it('çift sayıda ölçümde ortadaki ikinin ortalaması', () => {
    expect(median([200, 300, 400, 500])).toBe(350);
  });

  it('tek bir dalgınlık sonucu uçurmuyor', () => {
    // Ortalama 2056 ms çıkardı; ortanca gerçek tepkiyi veriyor.
    const trials = [285, 300, 9677, 310, 295];
    expect(median(trials)).toBe(300);
  });

  it('boş ölçüm sıfır', () => {
    expect(median([])).toBe(0);
  });
});
