/**
 * Uygulamanın dışarı açılan adresleri.
 *
 * Tek yerde duruyor: App Store gizlilik politikası ve kullanım
 * şartları bağlantılarının hem paywall'da hem ayarlarda aynı yere
 * gitmesi gerekiyor ve ikisi de yayından önce canlı olmalı.
 *
 * Metinler `legal/` klasöründe yazılı. `scripts/build-legal-site.sh`
 * onları `docs/` altındaki siteye çeviriyor, GitHub Pages de bu
 * adreslerden sunuyor. Alan adı alınırsa Pages'e özel alan adı
 * tanımlanıp burası `https://neuropeak.app/...` olarak değişir.
 */
export const PRIVACY_URL = 'https://digitalsepa-git.github.io/neuropeak/privacy/';
export const TERMS_URL = 'https://digitalsepa-git.github.io/neuropeak/terms/';

/** Destek kutusu; mağaza kaydındaki adresle aynı olmalı. */
export const SUPPORT_EMAIL = 'destek@neuropeak.app';

export function supportMailto(subject: string): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
