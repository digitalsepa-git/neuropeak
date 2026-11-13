import { Platform } from 'react-native';

import { EXIT_OFFER_PLAN, FALLBACK_PLANS, PRODUCT_IDS } from './catalog';
import { pricedPlan, yearlyCostOfWeekly, type StorePrice } from './pricing';
import type { BillingProvider, Entitlement, Plan, PlanId, PurchaseOutcome } from './types';

const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

const apiKey = Platform.select({ ios: iosKey, android: androidKey, default: undefined });

export const hasRevenueCatKey = typeof apiKey === 'string' && apiKey.length > 0;

/** RevenueCat'in PRO erişimini tanımladığı yetki adı. */
const ENTITLEMENT_ID = 'pro';

/**
 * RevenueCat yerel bir modül; Expo Go'da yok. Bu yüzden yalnızca anahtar
 * tanımlıysa ve gerçekten gerektiğinde yükleniyor — böylece anahtarsız
 * geliştirme ortamında uygulama Expo Go'da çalışmaya devam ediyor.
 */
type PurchasesModule = typeof import('react-native-purchases');

let modulePromise: Promise<PurchasesModule> | null = null;
let configured = false;

async function loadPurchases(): Promise<PurchasesModule> {
  modulePromise ??= import('react-native-purchases');
  const module = await modulePromise;

  if (!configured && apiKey !== undefined) {
    module.default.configure({ apiKey });
    configured = true;
  }

  return module;
}

type Offerings = Awaited<ReturnType<PurchasesModule['default']['getOfferings']>>;
type Package = Offerings['current'] extends infer T
  ? T extends { availablePackages: infer P }
    ? P extends readonly (infer Item)[]
      ? Item
      : never
    : never
  : never;

/**
 * Bütün offering'lerdeki paketler.
 *
 * RevenueCat'te `current` yalnızca panelde "current" işaretlenmiş
 * offering; indirimli teklif gibi ürünler ayrı offering'lerde
 * durabiliyor ve orada durduklarında `current` içinde görünmüyorlar.
 */
function allPackages(offerings: Offerings): Package[] {
  return Object.values(offerings.all).flatMap(
    (offering) => offering.availablePackages as Package[],
  );
}

/** Ürün kimliğinden mağaza fiyatına. */
async function storeProducts(): Promise<Map<string, StorePrice>> {
  const { default: Purchases } = await loadPurchases();
  const offerings = await Purchases.getOfferings();

  return new Map(
    allPackages(offerings).map((item) => [
      item.product.identifier,
      {
        price: item.product.price,
        priceString: item.product.priceString,
        pricePerWeekString: item.product.pricePerWeekString,
        pricePerYear: item.product.pricePerYear,
        currencyCode: item.product.currencyCode,
      } satisfies StorePrice,
    ]),
  );
}

export const revenueCatProvider: BillingProvider = {
  isConfigured: true,

  async getPlans(): Promise<Plan[]> {
    try {
      const products = await storeProducts();
      if (products.size === 0) return FALLBACK_PLANS;

      const weekly = products.get(PRODUCT_IDS.weekly);
      // Yıllık planın yanındaki üstü çizili rakam "bir yıl boyunca
      // haftalık ödemek"; haftalık ürün yoksa karşılaştıracak bir
      // şey de yok.
      const comparison = weekly === undefined ? undefined : yearlyCostOfWeekly(weekly);

      return FALLBACK_PLANS.map((plan) =>
        pricedPlan(
          plan,
          products.get(plan.productId),
          plan.id === 'annual' ? comparison : undefined,
        ),
      );
    } catch {
      return FALLBACK_PLANS;
    }
  },

  async getExitOffer(): Promise<Plan> {
    try {
      const products = await storeProducts();
      const annual = products.get(PRODUCT_IDS.annual);

      return pricedPlan(
        EXIT_OFFER_PLAN,
        products.get(EXIT_OFFER_PLAN.productId),
        annual === undefined ? undefined : { amount: annual.price, label: annual.priceString },
      );
    } catch {
      return EXIT_OFFER_PLAN;
    }
  },

  async purchase(planId: PlanId): Promise<PurchaseOutcome> {
    try {
      const { default: Purchases } = await loadPurchases();
      const offerings = await Purchases.getOfferings();
      // Bütün offering'lere bakılıyor, yalnızca `current`'a değil:
      // indirimli yıllık ürün genellikle ayrı bir offering'de durur
      // ve yalnızca current'a bakmak onu satın alınamaz yapardı.
      const target = allPackages(offerings).find(
        (item) => item.product.identifier === PRODUCT_IDS[planId],
      );

      if (target === undefined) {
        return { status: 'unavailable', issue: 'plan_missing' };
      }

      const result = await Purchases.purchasePackage(target);
      const active = result.customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      return active ? { status: 'purchased' } : { status: 'error', issue: 'not_verified' };
    } catch (error) {
      // Kullanıcı vazgeçtiyse bu bir hata değil.
      if (typeof error === 'object' && error !== null && 'userCancelled' in error) {
        if ((error as { userCancelled?: boolean }).userCancelled === true) {
          return { status: 'cancelled' };
        }
      }
      return { status: 'error', issue: 'purchase_failed' };
    }
  },

  async restore(): Promise<PurchaseOutcome> {
    try {
      const { default: Purchases } = await loadPurchases();
      const info = await Purchases.restorePurchases();
      const active = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      return active ? { status: 'purchased' } : { status: 'error', issue: 'no_subscription' };
    } catch {
      return { status: 'error', issue: 'restore_failed' };
    }
  },

  async getEntitlement(): Promise<Entitlement> {
    try {
      const { default: Purchases } = await loadPurchases();
      const info = await Purchases.getCustomerInfo();
      const entitlement = info.entitlements.active[ENTITLEMENT_ID];

      return {
        isPro: entitlement !== undefined,
        expiresAt: entitlement?.expirationDate ?? null,
      };
    } catch {
      return { isPro: false, expiresAt: null };
    }
  },
};

export { EXIT_OFFER_PLAN };
