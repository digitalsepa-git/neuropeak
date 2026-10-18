import { describe, expect, it } from 'vitest';

import {
  MEANINGFUL_TRAIT_SPREAD,
  rankOutcomes,
  rankTraits,
  scoreProfile,
  traitSpread,
  type ProfileQuestionShape,
} from './profile';

const QUESTIONS: ProfileQuestionShape[] = [
  { options: [{ weights: { a: 2 } }, { weights: { b: 2 } }] },
  { options: [{ weights: { a: 1, b: 1 } }, { weights: { a: 2 } }] },
];

describe('profil puanlaması', () => {
  it('eksenler kendi tavanına göre ölçekleniyor', () => {
    // a için tavan 2 + 2 = 4, b için 2 + 1 = 3.
    const scores = scoreProfile(QUESTIONS, [0, 1]);
    expect(scores.a).toBeCloseTo(4 / 4, 5);
    expect(scores.b).toBeCloseTo(0 / 3, 5);
  });

  it('farklı sayıda soru alan eksenler karşılaştırılabilir', () => {
    // Tek bir eksene daha çok soru yazmak onu kendiliğinden öne
    // çıkarmamalı: ikisi de kendi tavanının yarısında.
    const questions: ProfileQuestionShape[] = [
      { options: [{ weights: { x: 2 } }, { weights: { x: 0 } }] },
      { options: [{ weights: { x: 2 } }, { weights: { x: 0 } }] },
      { options: [{ weights: { y: 2 } }, { weights: { y: 0 } }] },
    ];
    const scores = scoreProfile(questions, [0, 1, 1]);
    expect(scores.x).toBeCloseTo(0.5, 5);
    expect(scores.y).toBeCloseTo(0, 5);
  });

  it('cevaplanmamış soru paydaya girmiyor', () => {
    // Yarıda bırakılan test kalan eksenleri cezalandırmamalı.
    const scores = scoreProfile(QUESTIONS, [0, null]);
    expect(scores.a).toBeCloseTo(1, 5);
  });

  it('aralık dışı cevap yok sayılıyor', () => {
    const scores = scoreProfile(QUESTIONS, [9, 0]);
    expect(scores.a).toBeCloseTo(0.5, 5);
    expect(scores.b).toBeCloseTo(1, 5);
  });

  it('hiç cevap yoksa puan yok', () => {
    expect(scoreProfile(QUESTIONS, [])).toEqual({});
  });

  it('puanlar 0 ile 1 arasında kalıyor', () => {
    const scores = scoreProfile(QUESTIONS, [0, 1]);
    for (const value of Object.values(scores)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});

describe('eksen sıralaması', () => {
  it('yüksekten düşüğe', () => {
    expect(rankTraits({ a: 0.2, b: 0.9, c: 0.5 })).toEqual(['b', 'c', 'a']);
  });

  it('eşitlikte sıra sabit', () => {
    expect(rankTraits({ b: 0.5, a: 0.5 })).toEqual(['a', 'b']);
  });

  it('fark hesaplanıyor', () => {
    expect(traitSpread({ a: 0.2, b: 0.9 })).toBeCloseTo(0.7, 5);
    expect(traitSpread({})).toBe(0);
    expect(MEANINGFUL_TRAIT_SPREAD).toBeGreaterThan(0);
  });
});

describe('sonuç eşleşmesi', () => {
  const outcomes = [
    { id: 'explorer', traits: ['intuitive', 'creative'] },
    { id: 'architect', traits: ['analytic', 'methodical'] },
    { id: 'strategist', traits: ['analytic', 'intuitive'] },
  ];

  it('en yüksek ortalamayı veren sonuç önde', () => {
    const scores = { analytic: 0.9, methodical: 0.8, intuitive: 0.2, creative: 0.1 };
    expect(rankOutcomes(outcomes, scores)[0]?.outcome.id).toBe('architect');
  });

  it('eşleşme puanı eksenlerin ortalaması', () => {
    const scores = { analytic: 0.6, methodical: 0.4, intuitive: 0, creative: 0 };
    const match = rankOutcomes(outcomes, scores).find((item) => item.outcome.id === 'architect');
    expect(match?.score).toBeCloseTo(0.5, 5);
  });

  it('eşitlikte tanım sırası korunuyor', () => {
    const scores = { analytic: 0.5, methodical: 0.5, intuitive: 0.5, creative: 0.5 };
    expect(rankOutcomes(outcomes, scores).map((item) => item.outcome.id)).toEqual([
      'explorer',
      'architect',
      'strategist',
    ]);
  });

  it('eksik eksen sıfır sayılıyor', () => {
    const match = rankOutcomes(outcomes, { analytic: 1 }).find(
      (item) => item.outcome.id === 'architect',
    );
    expect(match?.score).toBeCloseTo(0.5, 5);
  });
});
