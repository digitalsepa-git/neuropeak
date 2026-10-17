import type { AppLanguage } from '@neuropeak/core';

/** Değişkensiz metin. */
export type PlainEntry = {
  readonly tr: string;
  readonly en: string;
};

/**
 * Değişkenli metin.
 *
 * Şablon yerine fonksiyon: "Seviye 2'ye ulaştın" cümlesindeki ek
 * sayının okunuşuna bağlı ve İngilizcede hiç yok. Yer tutucu
 * değiştirmekle çözülemeyen bu farkları her dil kendi içinde
 * hallediyor.
 */
export type TemplatedEntry<P> = {
  readonly tr: (params: P) => string;
  readonly en: (params: P) => string;
};

/**
 * Katalogdaki bir girdi. Parametreli girdiler `never` ile tutuluyor:
 * her parametre tipi `never` parametreli imzaya atanabiliyor, böylece
 * katalog tek tipte toplanırken girdinin kendi parametre tipi
 * `satisfies` sayesinde korunuyor.
 */
export type StringEntry = PlainEntry | TemplatedEntry<never>;

export type StringCatalogue = Readonly<Record<string, StringEntry>>;

/** Değişkenli girdilerde parametre zorunlu, düz metinlerde yasak. */
export type EntryParams<E> = E extends TemplatedEntry<infer P> ? [params: P] : [];

export type Translate<C extends StringCatalogue> = <K extends keyof C>(
  key: K,
  ...params: EntryParams<C[K]>
) => string;

export function translate<C extends StringCatalogue, K extends keyof C>(
  catalogue: C,
  language: AppLanguage,
  key: K,
  params?: unknown,
): string {
  const entry = catalogue[key];
  if (entry === undefined) {
    // Anahtar yoksa anahtarın kendisi görünür: boş bir alan, hangi
    // metnin eksik olduğunu gizlerdi.
    return String(key);
  }

  const value: string | ((params: never) => string) = entry[language];
  // Parametreler çağrı yerinde `EntryParams` ile denetleniyor; burada
  // girdi tipi `never` olduğu için tek dönüşüm gerekiyor.
  return typeof value === 'function' ? value(params as never) : value;
}
