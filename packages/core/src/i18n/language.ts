import { toTurkishUpper } from '../utils/turkish';

/**
 * Uygulama dili.
 *
 * İki dil var ve ikisi de tam: Türkçe ve İngilizce. "Kısmen çevrilmiş
 * üçüncü dil" eklemek, kullanıcıya yarısı anlamadığı bir arayüz
 * göstermek demek olurdu.
 */
export type AppLanguage = 'tr' | 'en';

export const APP_LANGUAGES: readonly AppLanguage[] = ['tr', 'en'];

/** Dilin kendi dilindeki adı; dil seçiminde böyle gösterilir. */
export const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  tr: 'Türkçe',
  en: 'English',
};

export type Localized = {
  readonly tr: string;
  readonly en: string;
};

/**
 * Cihazın dil listesinden uygulama dilini seçer.
 *
 * Yalnızca Türkçe için Türkçe açılıyor; geri kalan herkes İngilizce
 * görüyor. Cihaz dili bilinmiyorsa da İngilizce: Türkçe bilmeyen
 * birine Türkçe arayüz göstermek, İngilizce bilmeyen bir Türk'e
 * İngilizce göstermekten daha sık karşılaşılan bir hata olurdu.
 */
export function resolveLanguage(locales: readonly (string | null | undefined)[]): AppLanguage {
  for (const locale of locales) {
    if (typeof locale !== 'string') continue;
    const tag = locale.trim().toLowerCase();
    if (tag === 'tr' || tag.startsWith('tr-') || tag.startsWith('tr_')) return 'tr';
  }

  return 'en';
}

/** Depolanmış dil değerini doğrular; tanınmayan değer yoksayılır. */
export function parseLanguage(value: unknown): AppLanguage | undefined {
  return value === 'tr' || value === 'en' ? value : undefined;
}

export function pickLocalized(value: Localized, language: AppLanguage): string {
  return value[language];
}

/**
 * Dile göre büyük harf.
 *
 * Türkçede "i" harfinin büyüğü "İ"; JavaScript'in kendi
 * `toUpperCase`'i bunu bilmiyor ve "İPUCU" yerine "IPUCU" üretiyor.
 * İngilizcede böyle bir istisna yok.
 */
export function toUpperCaseIn(language: AppLanguage, value: string): string {
  return language === 'tr' ? toTurkishUpper(value) : value.toUpperCase();
}
