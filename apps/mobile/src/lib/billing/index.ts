import AsyncStorage from '@react-native-async-storage/async-storage';

import { EXIT_OFFER_PLAN, FALLBACK_PLANS } from './catalog';
import { hasRevenueCatKey, revenueCatProvider } from './revenuecat';
import type { BillingProvider, Entitlement, PurchaseOutcome } from './types';

const DEV_PRO_KEY = 'neuropeak.dev.proOverride';

/**
 * Mağaza bağlantısı kurulmadan önceki sağlayıcı. Planları gösterir ama
 * satın alma yapmaz: sahte bir satın alma akışı yanıltıcı olur ve
 * yanlışlıkla yayına çıkabilir.
 *
 * Geliştirme derlemelerinde ayarlardaki geliştirici anahtarı PRO durumunu
 * elle açabilir; yayın derlemesinde __DEV__ false olduğu için bu yol kapalı.
 */
const localProvider: BillingProvider = {
  isConfigured: false,

  getPlans: () => Promise.resolve(FALLBACK_PLANS),

  purchase: () =>
    Promise.resolve<PurchaseOutcome>({
      status: 'unavailable',
      message: 'Mağaza bağlantısı henüz kurulmadı. Abonelik yakında açılacak.',
    }),

  restore: () =>
    Promise.resolve<PurchaseOutcome>({
      status: 'unavailable',
      message: 'Mağaza bağlantısı henüz kurulmadı.',
    }),

  async getEntitlement(): Promise<Entitlement> {
    if (!__DEV__) {
      return { isPro: false, expiresAt: null };
    }

    try {
      const raw = await AsyncStorage.getItem(DEV_PRO_KEY);
      return { isPro: raw === 'true', expiresAt: null };
    } catch {
      return { isPro: false, expiresAt: null };
    }
  },
};

export const billing: BillingProvider = hasRevenueCatKey ? revenueCatProvider : localProvider;

export const isBillingConfigured = billing.isConfigured;

/** Yalnızca geliştirme derlemelerinde; ayarlardaki geliştirici bölümünden. */
export async function setDevProOverride(value: boolean): Promise<void> {
  if (!__DEV__) return;
  try {
    await AsyncStorage.setItem(DEV_PRO_KEY, value ? 'true' : 'false');
  } catch {
    // yoksay
  }
}

export { EXIT_OFFER_PLAN, FALLBACK_PLANS };
export type { Entitlement, Plan, PlanId, PurchaseOutcome } from './types';
