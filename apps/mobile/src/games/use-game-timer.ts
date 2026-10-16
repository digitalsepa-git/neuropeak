import { useEffect, useRef, useState } from 'react';

/** Süreli oyunların varsayılan tur süresi. */
export const TIMED_ROUND_SECONDS = 60;

export function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Süreli oyunların geri sayımı. Süre bitince `onExpire` bir kez çağrılır.
 */
export function useGameTimer(seconds: number, onExpire: () => void): number {
  const [remaining, setRemaining] = useState(seconds);
  const expireRef = useRef(onExpire);
  const fired = useRef(false);

  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (remaining === 0 && !fired.current) {
      fired.current = true;
      expireRef.current();
    }
  }, [remaining]);

  return remaining;
}
