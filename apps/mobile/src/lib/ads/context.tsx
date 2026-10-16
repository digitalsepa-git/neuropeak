import { canWatchRewardedAd, rewardedAdsRemaining, shouldShowInterstitial } from '@neuropeak/core';
import { createContext, use, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';

import { track } from '../analytics';
import { usePro } from '../billing/context';
import { useProgress } from '../progress/context';
import { useRemoteConfig } from '../remote/context';
import { ads, isAdsConfigured } from './index';
import type { AdOutcome } from './types';

type AdsContextValue = {
  readonly isConfigured: boolean;
  /** Bugün kaç ödüllü reklam hakkı kaldı. */
  readonly rewardedLeft: number;
  readonly canWatchRewarded: boolean;
  /** Oyun turu bittiğinde çağrılır; koşullar uygunsa reklam gösterir. */
  afterRound: () => Promise<void>;
  /** Ödüllü reklamı gösterir; sonuna kadar izlenirse yıldız verir. */
  watchRewarded: () => Promise<AdOutcome>;
};

const AdsContext = createContext<AdsContextValue>({
  isConfigured: false,
  rewardedLeft: 0,
  canWatchRewarded: false,
  afterRound: () => Promise.resolve(),
  watchRewarded: () => Promise.resolve<AdOutcome>({ status: 'unavailable' }),
});

/**
 * Reklam gösterme kararı tek yerde.
 *
 * Ne zaman gösterileceği `@neuropeak/core`'daki saf fonksiyonda, kaç
 * tur geçtiği ve son reklamın ne zaman gösterildiği burada. Sayaç
 * ref'te: reklam kararı render'a bağlı değil ve sayacın değişmesi
 * ekranı yeniden çizmemeli.
 */
export function AdsProvider({ children }: { children: ReactNode }) {
  const { isPro } = usePro();
  const { getBoolean, getNumber } = useRemoteConfig();
  const { state, grantRewardedAdStars } = useProgress();

  const roundsSinceLastAd = useRef(0);
  const lastAdAt = useRef<number | null>(null);

  const adsEnabled = getBoolean('ads.enabled');
  const every = getNumber('ads.interstitial_every');
  const totalRounds = Object.values(state.categoryRounds).reduce(
    (total, count) => total + count,
    0,
  );

  // Reklam SDK'sı açılışta bir kez hazırlanıyor; gösterim anındaki
  // bekleme oyunun ortasında fark edilirdi. PRO kullanıcıda hiç
  // yüklenmiyor.
  useEffect(() => {
    if (isPro || !isAdsConfigured) return;
    void ads.prepare();
  }, [isPro]);

  const afterRound = useCallback(async () => {
    roundsSinceLastAd.current += 1;

    const last = lastAdAt.current;
    const ready = shouldShowInterstitial({
      isPro,
      adsEnabled,
      totalRounds,
      roundsSinceLastAd: roundsSinceLastAd.current,
      every,
      msSinceLastAd: last === null ? Number.POSITIVE_INFINITY : Date.now() - last,
    });

    if (!ready) return;

    const outcome = await ads.showInterstitial();
    if (outcome.status === 'unavailable' || outcome.status === 'error') return;

    track('ad_watched', { kind: 'interstitial' });
    roundsSinceLastAd.current = 0;
    lastAdAt.current = Date.now();
  }, [adsEnabled, every, isPro, totalRounds]);

  // PRO'da ödüllü reklam da yok: paywall'da "reklamsız deneyim" sözü
  // verildi, yıldız için reklam izletmek o sözü geri alırdı.
  const canWatchRewarded =
    isAdsConfigured &&
    !isPro &&
    canWatchRewardedAd({ adsEnabled, watchedToday: state.rewardedAdsToday });

  const watchRewarded = useCallback(async (): Promise<AdOutcome> => {
    if (!canWatchRewarded) return { status: 'unavailable' };

    const outcome = await ads.showRewarded();
    if (outcome.status === 'rewarded') {
      track('ad_watched', { kind: 'rewarded' });
      await grantRewardedAdStars();
    }

    return outcome;
  }, [canWatchRewarded, grantRewardedAdStars]);

  const value = useMemo<AdsContextValue>(
    () => ({
      isConfigured: isAdsConfigured,
      rewardedLeft: rewardedAdsRemaining(state.rewardedAdsToday),
      canWatchRewarded,
      afterRound,
      watchRewarded,
    }),
    [afterRound, canWatchRewarded, state.rewardedAdsToday, watchRewarded],
  );

  return <AdsContext value={value}>{children}</AdsContext>;
}

export function useAds(): AdsContextValue {
  return use(AdsContext);
}
