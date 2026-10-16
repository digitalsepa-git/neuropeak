import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_REMOTE_CONFIG, mergeRemoteConfig, type RemoteConfig } from '@neuropeak/core';

import { isSupabaseConfigured, supabase } from '../supabase';

const CACHE_KEY = 'neuropeak.remoteConfig.v1';

/**
 * Uzaktan yapılandırma okuyucusu.
 *
 * Üç katman: son bilinen değerler cihazda, güncelleri sunucuda,
 * varsayılanlar kodda. Açılışta önce cihazdaki okunuyor — ağ beklerken
 * uygulama varsayılanlarla açılıp sonra zıplamasın. Sunucudan gelen
 * her değer `mergeRemoteConfig`'ten geçiyor, yani bozuk bir değer
 * varsayılana düşüyor.
 */

export async function loadCachedConfig(): Promise<RemoteConfig> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw === null) return DEFAULT_REMOTE_CONFIG;

    return mergeRemoteConfig(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return DEFAULT_REMOTE_CONFIG;
  }
}

/**
 * Sunucudaki yapılandırmayı çeker. Bağlantı yoksa ya da istek
 * başarısızsa `null` döner; çağıran önbellekteki değerlerle devam
 * eder.
 */
export async function fetchRemoteConfig(): Promise<RemoteConfig | null> {
  if (!isSupabaseConfigured || supabase === null) return null;

  try {
    const { data, error } = await supabase.from('app_config').select('key, value');
    if (error !== null || data === null) return null;

    const raw: Record<string, unknown> = {};
    for (const row of data as { key: string; value: unknown }[]) {
      raw[row.key] = row.value;
    }

    const merged = mergeRemoteConfig(raw);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(merged)).catch(() => undefined);
    return merged;
  } catch {
    return null;
  }
}
