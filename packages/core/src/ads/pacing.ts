import { DAILY_REWARDED_AD_LIMIT } from '../gamification/rewards';

/**
 * Reklam sıklığı.
 *
 * Reklamın ne zaman çıkacağı ürünün en kolay bozulan yeri: iki tur
 * arka arkaya reklam gösteren bir beyin oyunu, oyunun kendisini
 * bozuyor. Karar bu yüzden tek bir saf fonksiyonda ve testli.
 *
 * Üç koruma var:
 * - **PRO'ya hiç gösterilmez.** Ödeyen kullanıcıya reklam, abonelik
 *   vaadinin ihlali.
 * - **İlk turlar reklamsız.** Yeni kullanıcı uygulamayı tanımadan
 *   reklam görürse kalmıyor.
 * - **Soğuma süresi.** Sayaç dolsa bile son reklamdan beri yeterli
 *   zaman geçmediyse gösterilmiyor; arka arkaya iki reklamı tek
 *   başına sayaç engelleyemiyor.
 */

/** Bu kadar tur oynanmadan hiç reklam gösterilmez. */
export const GRACE_ROUNDS = 5;

/** İki geçiş reklamı arasındaki en kısa süre. */
export const INTERSTITIAL_COOLDOWN_MS = 120_000;

export type InterstitialInput = {
  readonly isPro: boolean;
  readonly adsEnabled: boolean;
  /** Oyuncunun bugüne kadar oynadığı toplam tur. */
  readonly totalRounds: number;
  /** Son reklamdan bu yana oynanan tur. */
  readonly roundsSinceLastAd: number;
  /** Kaç turda bir gösterileceği; uzaktan yapılandırmadan gelir. */
  readonly every: number;
  /** Son reklamın üstünden geçen süre (ms); hiç gösterilmediyse Infinity. */
  readonly msSinceLastAd: number;
};

export function shouldShowInterstitial(input: InterstitialInput): boolean {
  if (input.isPro) return false;
  if (!input.adsEnabled) return false;
  if (input.totalRounds < GRACE_ROUNDS) return false;
  if (input.msSinceLastAd < INTERSTITIAL_COOLDOWN_MS) return false;

  const every = Math.max(1, Math.floor(input.every));
  return input.roundsSinceLastAd >= every;
}

/** Bugün daha kaç ödüllü reklam izlenebilir. */
export function rewardedAdsRemaining(watchedToday: number): number {
  return Math.max(0, DAILY_REWARDED_AD_LIMIT - Math.max(0, watchedToday));
}

export function canWatchRewardedAd(options: {
  readonly adsEnabled: boolean;
  readonly watchedToday: number;
}): boolean {
  // Ödüllü reklam PRO'ya da açık: izlemeyi kullanıcı seçiyor ve
  // karşılığında yıldız alıyor. Engellenen tek şey istenmeden gelen
  // reklam.
  return options.adsEnabled && rewardedAdsRemaining(options.watchedToday) > 0;
}
