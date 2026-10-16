import { describe, expect, it } from 'vitest';

import { DAILY_REWARDED_AD_LIMIT } from '../gamification/rewards';
import {
  GRACE_ROUNDS,
  INTERSTITIAL_COOLDOWN_MS,
  canWatchRewardedAd,
  rewardedAdsRemaining,
  shouldShowInterstitial,
  type InterstitialInput,
} from './pacing';

const READY: InterstitialInput = {
  isPro: false,
  adsEnabled: true,
  totalRounds: 40,
  roundsSinceLastAd: 4,
  every: 4,
  msSinceLastAd: Number.POSITIVE_INFINITY,
};

describe('geçiş reklamı', () => {
  it('sayaç dolduğunda gösterilir', () => {
    expect(shouldShowInterstitial(READY)).toBe(true);
  });

  it('sayaç dolmadan gösterilmez', () => {
    expect(shouldShowInterstitial({ ...READY, roundsSinceLastAd: 3 })).toBe(false);
  });

  it('PRO kullanıcıya hiç gösterilmez', () => {
    expect(shouldShowInterstitial({ ...READY, isPro: true })).toBe(false);
  });

  it('reklamlar kapalıyken gösterilmez', () => {
    expect(shouldShowInterstitial({ ...READY, adsEnabled: false })).toBe(false);
  });

  it('ilk turlarda gösterilmez', () => {
    expect(
      shouldShowInterstitial({ ...READY, totalRounds: GRACE_ROUNDS - 1, roundsSinceLastAd: 99 }),
    ).toBe(false);

    expect(shouldShowInterstitial({ ...READY, totalRounds: GRACE_ROUNDS })).toBe(true);
  });

  it('soğuma süresi dolmadan gösterilmez', () => {
    expect(shouldShowInterstitial({ ...READY, msSinceLastAd: INTERSTITIAL_COOLDOWN_MS - 1 })).toBe(
      false,
    );

    expect(shouldShowInterstitial({ ...READY, msSinceLastAd: INTERSTITIAL_COOLDOWN_MS })).toBe(
      true,
    );
  });

  it('sayaç dolsa bile soğuma kazanır', () => {
    // Arka arkaya iki reklamı tek başına sayaç engelleyemiyor.
    expect(shouldShowInterstitial({ ...READY, roundsSinceLastAd: 100, msSinceLastAd: 1000 })).toBe(
      false,
    );
  });

  it('bozuk sıklık değeri çökertmez', () => {
    expect(shouldShowInterstitial({ ...READY, every: 0 })).toBe(true);
    expect(shouldShowInterstitial({ ...READY, every: -5 })).toBe(true);
    expect(shouldShowInterstitial({ ...READY, every: 2.7, roundsSinceLastAd: 2 })).toBe(true);
  });
});

describe('ödüllü reklam', () => {
  it('günlük hak azalır', () => {
    expect(rewardedAdsRemaining(0)).toBe(DAILY_REWARDED_AD_LIMIT);
    expect(rewardedAdsRemaining(1)).toBe(DAILY_REWARDED_AD_LIMIT - 1);
    expect(rewardedAdsRemaining(DAILY_REWARDED_AD_LIMIT)).toBe(0);
  });

  it('hak eksiye düşmez', () => {
    expect(rewardedAdsRemaining(DAILY_REWARDED_AD_LIMIT + 5)).toBe(0);
    expect(rewardedAdsRemaining(-3)).toBe(DAILY_REWARDED_AD_LIMIT);
  });

  it('hak bitince izlenemez', () => {
    expect(canWatchRewardedAd({ adsEnabled: true, watchedToday: 0 })).toBe(true);
    expect(canWatchRewardedAd({ adsEnabled: true, watchedToday: DAILY_REWARDED_AD_LIMIT })).toBe(
      false,
    );
  });

  it('reklamlar kapalıyken izlenemez', () => {
    expect(canWatchRewardedAd({ adsEnabled: false, watchedToday: 0 })).toBe(false);
  });
});
