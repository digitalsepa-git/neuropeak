import { useCallback, useEffect, useRef } from 'react';

import type { RoundOutcome } from './types';

/**
 * Bir oyun turunun sonucunu tam olarak bir kez bildirir.
 *
 * Oyunlar iki şekilde bitebilir: oyuncu kaybeder ya da ekrandan çıkar.
 * İkisinde de aynı sonucun iki kez gönderilmemesi gerekiyor; ayrıca
 * ekrandan çıkışta güncel skorun okunabilmesi gerekiyor. Oyunlar
 * durumları değiştikçe `report` çağırır, bitişte `finishNow`.
 */
export function useRoundFinish(
  onFinish: (outcome: RoundOutcome) => void,
  onProgress?: (outcome: RoundOutcome) => void,
) {
  const finished = useRef(false);
  const latest = useRef<RoundOutcome>({ score: 0, level: 1, completed: false });
  const callback = useRef(onFinish);
  const progressCallback = useRef(onProgress);

  useEffect(() => {
    callback.current = onFinish;
    progressCallback.current = onProgress;
  }, [onFinish, onProgress]);

  const report = useCallback((outcome: RoundOutcome) => {
    latest.current = outcome;
    progressCallback.current?.(outcome);
  }, []);

  const finishNow = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    callback.current(latest.current);
  }, []);

  // Ekrandan çıkış da bir bitiştir.
  useEffect(() => finishNow, [finishNow]);

  return { report, finishNow };
}
