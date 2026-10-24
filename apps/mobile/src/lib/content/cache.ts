import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Catalogue } from './catalogue';

/**
 * İçerik önbelleği.
 *
 * Her açılışta ağa gitmek yerine en son çekilen içerik cihazda
 * duruyor ve uygulama onunla açılıyor; tazeleme arka planda
 * yapılıyor. İçerik nadiren değişiyor (panelden bir metin
 * düzeltilince), oysa açılış gecikmesi her seferinde hissediliyor.
 *
 * Anahtarda sürüm var: içerik tiplerinin şekli değişirse eski
 * önbellek okunmaya çalışılmasın, sessizce atlansın.
 */

const CACHE_KEY = 'neuropeak.content.v1';

/**
 * Önbelleğin tazelenmeden kullanılabileceği süre.
 *
 * Altı saat: gün içinde yapılan bir düzeltme oyuncuya aynı gün
 * ulaşıyor ama uygulamayı günde birkaç kez açan biri her seferinde
 * ağ beklemiyor. Bayat önbellek de kullanılıyor — süre dolduğunda
 * uygulama beklemiyor, arka planda tazeliyor.
 */
export const STALE_AFTER_MS = 6 * 60 * 60 * 1000;

export type CachedContent = {
  readonly fetchedAt: number;
  readonly catalogue: Partial<Catalogue>;
};

export function isStale(cached: CachedContent | null, now: number): boolean {
  if (cached === null) return true;
  // İleri tarihli damga (cihaz saati geri alınmış) bayat sayılıyor:
  // yoksa önbellek hiç tazelenmezdi.
  return now - cached.fetchedAt >= STALE_AFTER_MS || cached.fetchedAt > now;
}

export async function readCache(): Promise<CachedContent | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw === null) return null;

    const parsed = JSON.parse(raw) as Partial<CachedContent>;
    if (typeof parsed.fetchedAt !== 'number' || parsed.catalogue === undefined) return null;

    return { fetchedAt: parsed.fetchedAt, catalogue: parsed.catalogue };
  } catch {
    // Bozuk önbellek yok sayılıyor; gömülü banka zaten elimizde.
    return null;
  }
}

export async function writeCache(catalogue: Partial<Catalogue>, now: number): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: now, catalogue }));
  } catch {
    // Yazılamazsa oturum içinde doğru çalışmaya devam eder; bir
    // sonraki açılışta yeniden çekilir.
  }
}
