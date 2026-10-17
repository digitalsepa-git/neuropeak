/**
 * Uygulamanın dışarı açılan adresleri.
 *
 * Tek yerde duruyor: App Store gizlilik politikası ve kullanım
 * şartları bağlantılarının hem paywall'da hem ayarlarda aynı yere
 * gitmesi gerekiyor ve ikisi de yayından önce canlı olmalı.
 *
 * Metinler `legal/` klasöründe yazılı; bu adreslere yayımlanacaklar.
 */
export const PRIVACY_URL = 'https://neuropeak.app/privacy';
export const TERMS_URL = 'https://neuropeak.app/terms';

/** Destek kutusu; mağaza kaydındaki adresle aynı olmalı. */
export const SUPPORT_EMAIL = 'destek@neuropeak.app';

export function supportMailto(subject: string): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
