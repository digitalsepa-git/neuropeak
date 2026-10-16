import { Platform, TurboModuleRegistry } from 'react-native';

import type { AdOutcome, AdProvider } from './types';

const iosInterstitial = process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL;
const androidInterstitial = process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL;
const iosRewarded = process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED;
const androidRewarded = process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED;

const interstitialUnit = Platform.select({
  ios: iosInterstitial,
  android: androidInterstitial,
  default: undefined,
});

const rewardedUnit = Platform.select({
  ios: iosRewarded,
  android: androidRewarded,
  default: undefined,
});

const hasAdMobUnits =
  typeof interstitialUnit === 'string' &&
  interstitialUnit.length > 0 &&
  typeof rewardedUnit === 'string' &&
  rewardedUnit.length > 0;

/**
 * AdMob'un yerel modülü bu derlemede var mı.
 *
 * Modülün kendisi `TurboModuleRegistry.getEnforcing` çağırıyor ve
 * modül yoksa içe aktarma anında fırlatıyor — Expo Go'da uygulamayı
 * kırmızı ekrana düşürüyordu. `get` fırlatmak yerine null döndürüyor,
 * böylece içe aktarmaya hiç girilmiyor.
 */
const hasNativeAdMob = TurboModuleRegistry.get('RNGoogleMobileAdsModule') !== null;

/** Reklam birimleri tanımlı ve yerel modül derlemede varsa AdMob kullanılabilir. */
export const canUseAdMob = hasAdMobUnits && hasNativeAdMob;

/**
 * AdMob yerel bir modül; Expo Go'da yok. RevenueCat'te olduğu gibi
 * yalnızca reklam birimi kimlikleri tanımlıysa ve gerçekten
 * gerektiğinde yükleniyor — böylece anahtarsız geliştirme ortamında
 * uygulama Expo Go'da çalışmaya devam ediyor.
 */
type AdsModule = typeof import('react-native-google-mobile-ads');

/** Modülün enum değerleri; tipleri `import type` olmadan buradan türetiliyor. */
type AdEvent = AdsModule['AdEventType'][keyof AdsModule['AdEventType']];
type RewardedEvent = AdsModule['RewardedAdEventType'][keyof AdsModule['RewardedAdEventType']];

type AdEventInfo = {
  readonly type: AdEvent | RewardedEvent;
  readonly payload: unknown;
};

let modulePromise: Promise<AdsModule> | null = null;
let initialised = false;

async function loadAds(): Promise<AdsModule> {
  modulePromise ??= import('react-native-google-mobile-ads');
  const module = await modulePromise;

  if (!initialised) {
    await module.default().initialize();
    initialised = true;
  }

  return module;
}

/**
 * Reklamı yükleyip gösterir ve kapanmasını bekler.
 *
 * Tek bir söz veriliyor ve dinleyici kapanışta kaldırılıyor: reklam
 * kapanmadan oyuna dönmek, kullanıcının kapatma anında bir sonraki
 * ekrana düşmesine yol açıyordu.
 *
 * Ödüllü reklam `AdEventType.LOADED` yerine
 * `RewardedAdEventType.LOADED` gönderiyor; ikisi de dinlenmezse
 * ödüllü reklam hiç gösterilmiyor.
 */
async function present(kind: 'interstitial' | 'rewarded'): Promise<AdOutcome> {
  try {
    const module = await loadAds();
    const unitId = kind === 'interstitial' ? interstitialUnit : rewardedUnit;
    if (unitId === undefined) return { status: 'unavailable' };

    return await new Promise<AdOutcome>((resolve) => {
      let earned = false;
      let settled = false;
      let unsubscribe: (() => void) | null = null;

      const finish = (outcome: AdOutcome) => {
        if (settled) return;
        settled = true;
        unsubscribe?.();
        resolve(outcome);
      };

      const handle = (event: AdEventInfo) => {
        switch (event.type) {
          case module.AdEventType.LOADED:
          case module.RewardedAdEventType.LOADED:
            ad.show().catch(() => finish({ status: 'error', message: 'Reklam gösterilemedi' }));
            break;
          case module.AdEventType.ERROR:
            finish({ status: 'error', message: 'Reklam yüklenemedi' });
            break;
          case module.RewardedAdEventType.EARNED_REWARD:
            earned = true;
            break;
          case module.AdEventType.CLOSED:
            if (kind === 'interstitial') finish({ status: 'shown' });
            else finish(earned ? { status: 'rewarded' } : { status: 'dismissed' });
            break;
          default:
            break;
        }
      };

      // Reklam ile dinleyicisi tek dalda kuruluyor: iki sınıfın olay
      // kümeleri farklı, ortak bir tipte çağrı derlenmiyor.
      const ad =
        kind === 'interstitial'
          ? (() => {
              const interstitial = module.InterstitialAd.createForAdRequest(unitId);
              unsubscribe = interstitial.addAdEventsListener<AdEvent>(handle);
              return interstitial;
            })()
          : (() => {
              const rewarded = module.RewardedAd.createForAdRequest(unitId);
              unsubscribe = rewarded.addAdEventsListener<AdEvent | RewardedEvent>(handle);
              return rewarded;
            })();

      ad.load();
    });
  } catch {
    return { status: 'unavailable' };
  }
}

export const adMobProvider: AdProvider = {
  isConfigured: true,

  async prepare(): Promise<void> {
    try {
      await loadAds();
    } catch {
      // Modül yoksa gösterim anında zaten 'unavailable' dönecek.
    }
  },

  showInterstitial: () => present('interstitial'),
  showRewarded: () => present('rewarded'),
};
