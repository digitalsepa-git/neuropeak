import type { Plan, PlanId } from '@/lib/billing';

import { useI18n } from './context';
import type { StringKey } from './strings';

const TITLE_KEYS: Record<PlanId, StringKey> = {
  weekly: 'plan.weekly',
  annual: 'plan.annual',
  annual_discounted: 'plan.annual',
};

const PERIOD_KEYS: Record<Plan['period'], StringKey> = {
  week: 'plan.period.week',
  year: 'plan.period.year',
};

/**
 * Plan verisinden gösterilecek metinler.
 *
 * Plan nesnesinde cümle yok; başlık, dönem adı ve rozet burada
 * kuruluyor, böylece aynı katalog iki dilde de çalışıyor.
 */
export function usePlanText() {
  const { t } = useI18n();

  return {
    title: (plan: Plan) => t(TITLE_KEYS[plan.id]),
    period: (plan: Plan) => t(PERIOD_KEYS[plan.period]),
    badge: (plan: Plan): string | undefined => {
      if (plan.discountPercent !== undefined) {
        return t('plan.discountBadge', { percent: plan.discountPercent });
      }
      if (plan.savingPercent !== undefined) {
        return t('plan.savingBadge', { percent: plan.savingPercent });
      }
      return undefined;
    },
    perWeek: (plan: Plan): string | undefined =>
      plan.perWeekPrice === undefined ? undefined : t('plan.perWeek', { price: plan.perWeekPrice }),
  };
}
