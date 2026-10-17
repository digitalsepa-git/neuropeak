import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { billing } from './index';
import type { PlanId, PurchaseOutcome } from './types';

type ProState = {
  readonly isPro: boolean;
  readonly expiresAt: string | null;
  readonly ready: boolean;
  purchase: (planId: PlanId) => Promise<PurchaseOutcome>;
  restore: () => Promise<PurchaseOutcome>;
  refresh: () => Promise<void>;
};

const ProContext = createContext<ProState>({
  isPro: false,
  expiresAt: null,
  ready: false,
  purchase: () => Promise.resolve({ status: 'unavailable', issue: 'store_not_ready' }),
  restore: () => Promise.resolve({ status: 'unavailable', issue: 'store_not_ready' }),
  refresh: () => Promise.resolve(),
});

export function ProProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const entitlement = await billing.getEntitlement();
    setIsPro(entitlement.isPro);
    setExpiresAt(entitlement.expiresAt);
    setReady(true);
  }, []);

  useEffect(() => {
    // Yetki durumu dış bir sistemden (mağaza SDK'sı) okunur; bu, efektin
    // tam da yapması gereken iş. Kural eşzamanlı setState sandığı için
    // burada susturuluyor — refresh asenkron, state await sonrası yazılıyor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const purchase = useCallback(
    async (planId: PlanId) => {
      const outcome = await billing.purchase(planId);
      if (outcome.status === 'purchased') {
        await refresh();
      }
      return outcome;
    },
    [refresh],
  );

  const restore = useCallback(async () => {
    const outcome = await billing.restore();
    if (outcome.status === 'purchased') {
      await refresh();
    }
    return outcome;
  }, [refresh]);

  const value = useMemo<ProState>(
    () => ({ isPro, expiresAt, ready, purchase, restore, refresh }),
    [expiresAt, isPro, purchase, ready, refresh, restore],
  );

  return <ProContext value={value}>{children}</ProContext>;
}

export function usePro(): ProState {
  return use(ProContext);
}
