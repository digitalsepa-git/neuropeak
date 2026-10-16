import { adMobProvider, canUseAdMob } from './admob';
import type { AdOutcome, AdProvider } from './types';

/**
 * AdMob kullanılamazken devreye giren sağlayıcı. Hiçbir şey
 * göstermiyor ve 'unavailable' dönüyor: sahte bir reklam ekranı,
 * sahte satın alma akışı kadar yanıltıcı olur.
 */
const localProvider: AdProvider = {
  isConfigured: false,
  prepare: () => Promise.resolve(),
  showInterstitial: () => Promise.resolve<AdOutcome>({ status: 'unavailable' }),
  showRewarded: () => Promise.resolve<AdOutcome>({ status: 'unavailable' }),
};

export const ads: AdProvider = canUseAdMob ? adMobProvider : localProvider;

export const isAdsConfigured = ads.isConfigured;

export type { AdOutcome, AdProvider } from './types';
