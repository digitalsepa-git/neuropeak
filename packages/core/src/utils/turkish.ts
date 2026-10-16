/**
 * Türkçe metin yardımcıları.
 *
 * Arayüzdeki iki küçük ama göze batan sorun burada çözülüyor: "i"
 * harfinin büyük hâli ve rakamlara gelen yönelme eki. İkisi de
 * İngilizce varsayımlarla yazılan kodun Türkçede yanlış sonuç verdiği
 * yerler.
 */

const TURKISH_UPPER: Readonly<Record<string, string>> = {
  i: 'İ',
  ı: 'I',
  ğ: 'Ğ',
  ü: 'Ü',
  ş: 'Ş',
  ö: 'Ö',
  ç: 'Ç',
};

/**
 * Türkçe büyük harf. `toUpperCase()` "i" harfini "I" yapar; oyun
 * tahtasında "İPLİK" yerine "IPLIK" görünmemesi için harf harf
 * eşleniyor. Hermes'te Intl'e güvenmek yerine tabloyu burada tutuyoruz.
 */
export function toTurkishUpper(value: string): string {
  let result = '';
  for (const character of value) {
    result += TURKISH_UPPER[character] ?? character.toUpperCase();
  }
  return result;
}

/** Birler basamağının okunuşuna göre yönelme eki: bir'e, iki'ye, altı'ya. */
const ONES_SUFFIX: Readonly<Record<number, string>> = {
  1: 'e',
  2: 'ye',
  3: 'e',
  4: 'e',
  5: 'e',
  6: 'ya',
  7: 'ye',
  8: 'e',
  9: 'a',
};

/** Onlar basamağı: on'a, yirmi'ye, otuz'a, kırk'a, elli'ye… */
const TENS_SUFFIX: Readonly<Record<number, string>> = {
  1: 'a',
  2: 'ye',
  3: 'a',
  4: 'a',
  5: 'ye',
  6: 'a',
  7: 'e',
  8: 'e',
  9: 'a',
};

/**
 * Rakamla yazılmış bir sayıya gelecek yönelme eki — kesme işaretiyle
 * birlikte. Ek sayının okunuşuna bağlı: "2'ye" ama "3'e", "6'ya" ama
 * "7'ye". Düz `'e` eklemek "Seviye 2'e ulaştın" gibi yanlış cümleler
 * üretiyordu.
 *
 * @example turkishDativeSuffix(2) // "'ye"
 */
export function turkishDativeSuffix(value: number): string {
  const whole = Math.abs(Math.trunc(value));

  const ones = whole % 10;
  if (ones !== 0) return `'${ONES_SUFFIX[ones] as string}`;

  const tens = Math.floor(whole / 10) % 10;
  if (tens !== 0) return `'${TENS_SUFFIX[tens] as string}`;

  // Sıfırla biten geri kalan her sayı "yüz", "bin", "milyon" gibi
  // düz ünsüzle biten bir kelimeyle okunur; hepsi "e" eki alır.
  return "'e";
}
