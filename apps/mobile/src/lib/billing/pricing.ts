import type { Plan } from './types';

/**
 * Mağaza fiyatlarını plana işlemek.
 *
 * Katalogdaki fiyatlar yer tutucu: kapsam dokümanındaki TR
 * rakamları. Kullanıcı başka bir para birimindeyse ya da fiyat App
 * Store Connect'te değiştirilmişse katalogdaki rakam yanlış olur —
 * üstelik "şu kadara otomatik yenilenir" cümlesinde yanlış olur,
 * yani kullanıcıya ödeyeceğinden başka bir sayı söylemiş oluruz.
 * Apple da satın alma ekranında doğru fiyatı şart koşuyor.
 *
 * Bu yüzden fiyat **her zaman** mağazadan geliyor. Karşılaştırmalar
 * (üstü çizili rakam, tasarruf yüzdesi) da mağaza fiyatlarından
 * yeniden hesaplanıyor; hesaplanamıyorsa hiç gösterilmiyor.
 * Hesaplanamayan bir karşılaştırmayı katalogdaki eski değerle
 * doldurmak, yanlış bir indirim iddiası olurdu.
 */

/** Mağaza ürününden ihtiyacımız olan alanlar. */
export type StorePrice = {
  readonly price: number;
  readonly priceString: string;
  readonly pricePerWeekString: string | null;
  /** Mağaza hesaplamışsa yıllık maliyet; haftalık üründe dolu olur. */
  readonly pricePerYear: number | null;
  readonly currencyCode: string;
};

export type Comparison = {
  readonly amount: number;
  readonly label: string;
};

export function formatPrice(amount: number, currencyCode: string, locale?: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(
    amount,
  );
}

/**
 * Haftalık planın bir yıllık maliyeti — yıllık planın yanında
 * gösterilen üstü çizili rakam.
 *
 * Mağaza `pricePerYear` veriyorsa o kullanılıyor; vermiyorsa 52
 * haftadan hesaplanıyor. 52 yaklaşık bir sayı ama yıllık abonelik
 * fiyatıyla kıyaslanan şey tam olarak "bir yıl boyunca haftalık
 * ödemek".
 */
export function yearlyCostOfWeekly(weekly: StorePrice, locale?: string): Comparison {
  const amount = weekly.pricePerYear ?? weekly.price * 52;

  return { amount, label: formatPrice(amount, weekly.currencyCode, locale) };
}

/**
 * Planı mağaza fiyatıyla günceller.
 *
 * Ürün mağazada bulunamadıysa plan olduğu gibi dönüyor: elimizde
 * daha iyi bir bilgi yok ve planı listeden düşürmek, satın
 * alınabilir bir ürünü gizlemek olurdu.
 */
export function pricedPlan(plan: Plan, product?: StorePrice, comparedTo?: Comparison): Plan {
  if (product === undefined) return plan;

  const base: Plan = {
    ...plan,
    priceLabel: product.priceString,
    perWeekPrice: product.pricePerWeekString ?? undefined,
    // Katalogdaki karşılaştırmalar yer tutucuydu; mağaza fiyatıyla
    // yeniden kurulmadıkça gösterilmiyorlar.
    strikethroughLabel: undefined,
    savingPercent: undefined,
    discountPercent: undefined,
  };

  // Karşılaştırma ancak gerçekten ucuzsa anlamlı; eşit ya da pahalı
  // bir "indirim" göstermek yanlış olurdu.
  if (comparedTo === undefined || comparedTo.amount <= product.price) return base;

  const percent = Math.round((1 - product.price / comparedTo.amount) * 100);

  // Katalogda hangi alan kullanılmışsa o korunuyor: "tasarruf" ile
  // "indirim" arayüzde farklı cümleler.
  return plan.discountPercent === undefined
    ? { ...base, strikethroughLabel: comparedTo.label, savingPercent: percent }
    : { ...base, strikethroughLabel: comparedTo.label, discountPercent: percent };
}
