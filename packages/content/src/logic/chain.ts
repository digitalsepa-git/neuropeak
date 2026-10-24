import type { AppLanguage, LogicChainBank } from '@neuropeak/core';

/**
 * Mantık Zinciri'nin dile bağlı parçaları.
 *
 * Bulmacanın mantığı çekirdekte; buradaki tek şey o mantığın hangi
 * kelimelerle anlatıldığı. Cümle bir kalıp olarak duruyor çünkü iki
 * dilin söz dizimi farklı: Türkçede karşılaştırılan kişi cümlenin
 * ortasında ve ek alıyor, İngilizcede sonda ve ek almıyor.
 *
 * Adların iki biçimi var. `object` Türkçede ayrılma hâli — ek sesin
 * tonuna göre değişiyor ("Mert'ten" ama "Kerem'den", "Burak'tan" ama
 * "Ayşe'den"), bu yüzden kuralla üretmek yerine her ad için yazılı.
 * İngilizcede iki biçim de aynı.
 */

const TR: LogicChainBank = {
  names: [
    { subject: 'Deniz', object: "Deniz'den" },
    { subject: 'Mert', object: "Mert'ten" },
    { subject: 'Elif', object: "Elif'ten" },
    { subject: 'Burak', object: "Burak'tan" },
    { subject: 'Ayşe', object: "Ayşe'den" },
    { subject: 'Can', object: "Can'dan" },
    { subject: 'Zeynep', object: "Zeynep'ten" },
    { subject: 'Kerem', object: "Kerem'den" },
    { subject: 'Selin', object: "Selin'den" },
  ],
  kinds: {
    taller: { comparative: 'daha uzun', superlative: 'en uzun', least: 'en kısa' },
    faster: { comparative: 'daha hızlı', superlative: 'en hızlı', least: 'en yavaş' },
    older: { comparative: 'daha yaşlı', superlative: 'en yaşlı', least: 'en genç' },
    heavier: { comparative: 'daha ağır', superlative: 'en ağır', least: 'en hafif' },
  },
  premise: '{a}, {b} {comparative}.',
  question: 'Kim {superlative}?',
};

const EN: LogicChainBank = {
  names: [
    { subject: 'Dana', object: 'Dana' },
    { subject: 'Mark', object: 'Mark' },
    { subject: 'Ella', object: 'Ella' },
    { subject: 'Brian', object: 'Brian' },
    { subject: 'Aisha', object: 'Aisha' },
    { subject: 'Jon', object: 'Jon' },
    { subject: 'Zoe', object: 'Zoe' },
    { subject: 'Karim', object: 'Karim' },
    { subject: 'Selina', object: 'Selina' },
  ],
  kinds: {
    taller: { comparative: 'taller', superlative: 'the tallest', least: 'the shortest' },
    faster: { comparative: 'faster', superlative: 'the fastest', least: 'the slowest' },
    older: { comparative: 'older', superlative: 'the oldest', least: 'the youngest' },
    heavier: { comparative: 'heavier', superlative: 'the heaviest', least: 'the lightest' },
  },
  premise: '{a} is {comparative} than {b}.',
  question: 'Who is {superlative}?',
};

const BANKS: Record<AppLanguage, LogicChainBank> = { tr: TR, en: EN };

export function logicChainBankFor(language: AppLanguage): LogicChainBank {
  return BANKS[language];
}
