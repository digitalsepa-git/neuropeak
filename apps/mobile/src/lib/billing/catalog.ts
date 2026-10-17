import type { Plan, PlanId } from './types';

/** Mağazadaki ürün kimlikleri; RevenueCat'te de bu kimliklerle eşlenir. */
export const PRODUCT_IDS: Record<PlanId, string> = {
  weekly: 'neuropeak_pro_weekly',
  annual: 'neuropeak_pro_annual',
  annual_discounted: 'neuropeak_pro_annual_offer',
};

/**
 * Mağaza bağlantısı kurulmadan önce gösterilecek varsayılan katalog.
 * Fiyatlar kapsam dokümanındaki TR fiyatlarıdır; gerçek fiyat her zaman
 * mağazadan gelir ve kullanıcının para biriminde gösterilir.
 */
export const FALLBACK_PLANS: Plan[] = [
  {
    id: 'weekly',
    productId: PRODUCT_IDS.weekly,
    period: 'week',
    priceLabel: '₺349,99',
    trialDays: 3,
  },
  {
    id: 'annual',
    productId: PRODUCT_IDS.annual,
    period: 'year',
    priceLabel: '₺999,99',
    savingPercent: 94,
    perWeekPrice: '₺19,23',
    strikethroughLabel: '₺18.199,48',
  },
];

/** Paywall kapatılınca gösterilen tek seferlik indirimli teklif. */
export const EXIT_OFFER_PLAN: Plan = {
  id: 'annual_discounted',
  productId: PRODUCT_IDS.annual_discounted,
  period: 'year',
  priceLabel: '₺199,99',
  discountPercent: 80,
  perWeekPrice: '₺3,85',
  strikethroughLabel: '₺999,99',
};
