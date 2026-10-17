export type PlanId = 'weekly' | 'annual' | 'annual_discounted';

export type PlanPeriod = 'week' | 'year';

/**
 * Bir abonelik planı.
 *
 * Yalnızca sayılar ve fiyat dizeleri var, cümle yok: "%94 tasarruf"
 * ile "Save 94%" arasındaki fark arayüzün işi. Fiyatlar mağazadan
 * geldiği için zaten kullanıcının para biriminde ve diline göre
 * biçimlenmiş durumda.
 */
export type Plan = {
  readonly id: PlanId;
  /** Mağazadaki ürün kimliği. */
  readonly productId: string;
  readonly period: PlanPeriod;
  /** Gösterilecek fiyat; mağazadan gelirse kullanıcının para birimindedir. */
  readonly priceLabel: string;
  /** Ücretsiz deneme süresi (gün). */
  readonly trialDays?: number;
  /** Yıllık planın haftalığa göre tasarruf oranı (%). */
  readonly savingPercent?: number;
  /** Tek seferlik teklifin indirim oranı (%). */
  readonly discountPercent?: number;
  /** Yıllık planın haftalığa bölünmüş fiyatı. */
  readonly perWeekPrice?: string;
  /** Üstü çizili karşılaştırma fiyatı. */
  readonly strikethroughLabel?: string;
};

/** Satın alma akışında ne ters gitti; metni arayüz seçiyor. */
export type BillingIssue =
  | 'store_not_ready'
  | 'restore_not_ready'
  | 'plan_missing'
  | 'not_verified'
  | 'purchase_failed'
  | 'no_subscription'
  | 'restore_failed';

export type PurchaseOutcome =
  | { status: 'purchased' }
  | { status: 'cancelled' }
  /** Mağaza bağlantısı kurulu değil (geliştirme ortamı). */
  | { status: 'unavailable'; issue: BillingIssue }
  | { status: 'error'; issue: BillingIssue };

export type Entitlement = {
  readonly isPro: boolean;
  readonly expiresAt: string | null;
};

export type BillingProvider = {
  /** Gerçek mağaza bağlantısı var mı. */
  readonly isConfigured: boolean;
  getPlans(): Promise<Plan[]>;
  purchase(planId: PlanId): Promise<PurchaseOutcome>;
  restore(): Promise<PurchaseOutcome>;
  getEntitlement(): Promise<Entitlement>;
};
