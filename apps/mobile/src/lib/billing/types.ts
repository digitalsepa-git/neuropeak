export type PlanId = 'weekly' | 'annual' | 'annual_discounted';

export type Plan = {
  readonly id: PlanId;
  /** Mağazadaki ürün kimliği. */
  readonly productId: string;
  readonly title: string;
  /** Gösterilecek fiyat; mağazadan gelirse kullanıcının para birimindedir. */
  readonly priceLabel: string;
  readonly periodLabel: string;
  /** Ücretsiz deneme süresi (gün). */
  readonly trialDays?: number;
  /** Plan kartındaki küçük etiket: "%94 tasarruf" gibi. */
  readonly badge?: string;
  /** Yıllık planın haftalığa bölünmüş karşılığı. */
  readonly perWeekLabel?: string;
  /** Üstü çizili karşılaştırma fiyatı. */
  readonly strikethroughLabel?: string;
};

export type PurchaseOutcome =
  | { status: 'purchased' }
  | { status: 'cancelled' }
  /** Mağaza bağlantısı kurulu değil (geliştirme ortamı). */
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string };

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
