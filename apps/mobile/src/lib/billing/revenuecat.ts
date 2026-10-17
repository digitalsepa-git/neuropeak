import { Platform } from 'react-native';

import { EXIT_OFFER_PLAN, FALLBACK_PLANS, PRODUCT_IDS } from './catalog';
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

export const revenueCatProvider: BillingProvider = {
  isConfigured: true,

  async getPlans(): Promise<Plan[]> {
    try {
      const { default: Purchases } = await loadPurchases();
      const offerings = await Purchases.getOfferings();
      const packages = offerings.current?.availablePackages ?? [];

      if (packages.length === 0) {
        return FALLBACK_PLANS;
      }

      // Mağazadan gelen fiyatlar kullanıcının para birimindedir; metinler
      // bizim katalogdan, fiyatlar mağazadan gelir.
      return FALLBACK_PLANS.map((plan) => {
        const match = packages.find((item) => item.product.identifier === PRODUCT_IDS[plan.id]);
        return match === undefined ? plan : { ...plan, priceLabel: match.product.priceString };
      });
    } catch {
      return FALLBACK_PLANS;
    }
  },

  async purchase(planId: PlanId): Promise<PurchaseOutcome> {
    try {
      const { default: Purchases } = await loadPurchases();
      const offerings = await Purchases.getOfferings();
      const target = offerings.current?.availablePackages.find(
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
