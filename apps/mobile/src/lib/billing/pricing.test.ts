import { describe, expect, it } from 'vitest';

import { EXIT_OFFER_PLAN, FALLBACK_PLANS } from './catalog';
import { pricedPlan, yearlyCostOfWeekly, type StorePrice } from './pricing';
import type { Plan } from './types';

const weekly: StorePrice = {
  price: 9.99,
  priceString: '$9.99',
  pricePerWeekString: '$9.99',
  pricePerYear: 519.48,
  currencyCode: 'USD',
};

const annual: StorePrice = {
  price: 59.99,
  priceString: '$59.99',
  pricePerWeekString: '$1.15',
  pricePerYear: null,
  currencyCode: 'USD',
};

const annualPlan = FALLBACK_PLANS.find((plan) => plan.id === 'annual') as Plan;

describe('yearlyCostOfWeekly', () => {
  it('mağazanın yıllık rakamını kullanır', () => {
    expect(yearlyCostOfWeekly(weekly, 'en-US').amount).toBe(519.48);
  });

  it('mağaza vermezse 52 haftadan hesaplar', () => {
    const noYearly: StorePrice = { ...weekly, pricePerYear: null };

    expect(yearlyCostOfWeekly(noYearly, 'en-US').amount).toBeCloseTo(519.48, 2);
  });

  it('kullanıcının para biriminde biçimler', () => {
    expect(yearlyCostOfWeekly(weekly, 'en-US').label).toContain('519.48');
  });
});

describe('pricedPlan', () => {
  it('fiyatı mağazadan alır', () => {
    const priced = pricedPlan(annualPlan, annual);

    expect(priced.priceLabel).toBe('$59.99');
    expect(priced.perWeekPrice).toBe('$1.15');
  });

  it('ürün bulunamazsa planı olduğu gibi bırakır', () => {
    // Satın alınabilir bir ürünü listeden düşürmek, elimizde daha
    // iyi bilgi olmadığı için yanlış olurdu.
    expect(pricedPlan(annualPlan, undefined)).toEqual(annualPlan);
  });

  it('karşılaştırma yoksa katalogdaki yüzdeyi göstermez', () => {
    // Katalogdaki %94 TR fiyatlarına göreydi; mağaza fiyatıyla
    // doğrulanmadıkça yanlış bir indirim iddiası olur.
    const priced = pricedPlan(annualPlan, annual);

    expect(priced.savingPercent).toBeUndefined();
    expect(priced.strikethroughLabel).toBeUndefined();
  });

  it('tasarruf oranını mağaza fiyatlarından hesaplar', () => {
    const priced = pricedPlan(annualPlan, annual, yearlyCostOfWeekly(weekly, 'en-US'));

    // 59.99 / 519.48 → %88 tasarruf
    expect(priced.savingPercent).toBe(88);
    expect(priced.strikethroughLabel).toContain('519.48');
  });

  it('çıkış teklifinde indirim alanını kullanır', () => {
    const offer: StorePrice = { ...annual, price: 11.99, priceString: '$11.99' };
    const priced = pricedPlan(EXIT_OFFER_PLAN, offer, {
      amount: annual.price,
      label: annual.priceString,
    });

    expect(priced.discountPercent).toBe(80);
    expect(priced.savingPercent).toBeUndefined();
    expect(priced.strikethroughLabel).toBe('$59.99');
  });

  it('karşılaştırma ucuz değilse indirim göstermez', () => {
    const priced = pricedPlan(annualPlan, annual, { amount: 59.99, label: '$59.99' });

    expect(priced.savingPercent).toBeUndefined();
    expect(priced.strikethroughLabel).toBeUndefined();
  });
});
