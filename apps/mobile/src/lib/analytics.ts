import type { AnalyticsEvent } from '@neuropeak/core';
import { Platform } from 'react-native';

import { getUserId } from './session';
import { isSupabaseConfigured, supabase } from './supabase';

/**
 * Analitik gönderimi.
 *
 * Olaylar kuyruğa alınıp toplu gönderiliyor: her dokunuşta ağ isteği
 * açmak hem pili hem de oyunun akıcılığını bozar. Kuyruk kalıcı
 * değil — analitik olayı, ilerleme kaydının aksine kaybolabilir.
 * Kalıcı kuyruğa koymak, yeniden deneme ve tekilleştirme yüküne
 * değmeyecek bir garanti verirdi.
 *
 * Supabase bağlı değilken `track` sessizce hiçbir şey yapmıyor;
 * çağıran tarafın bunu bilmesi gerekmiyor.
 */

const FLUSH_SIZE = 20;
const FLUSH_INTERVAL_MS = 30_000;

/**
 * Olay özellikleri jsonb sütununa yazılıyor; iç içe nesne yerine düz
 * değerler bekleniyor. Bu kısıt bilerek: analitik sorgularında iç içe
 * yapıyı açmak her zaman daha pahalı.
 */
export type EventProperties = Record<string, string | number | boolean | null>;

type QueuedEvent = {
  name: AnalyticsEvent;
  properties: EventProperties;
  created_at: string;
};

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
let flushing = false;

export function track(name: AnalyticsEvent, properties: EventProperties = {}): void {
  if (!isSupabaseConfigured) return;

  queue.push({ name, properties, created_at: new Date().toISOString() });

  if (queue.length >= FLUSH_SIZE) void flushAnalytics();
}

export async function flushAnalytics(): Promise<void> {
  if (!isSupabaseConfigured || supabase === null) return;
  if (flushing || queue.length === 0) return;

  flushing = true;
  const batch = queue;
  queue = [];

  try {
    const userId = await getUserId();

    const { error } = await supabase.from('analytics_events').insert(
      batch.map((event) => ({
        user_id: userId,
        name: event.name,
        properties: event.properties,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        created_at: event.created_at,
      })),
    );

    // Gönderilemeyen parti geri konmuyor: kuyruk kalıcı olmadığı için
    // bir sonraki açılışta zaten kaybolacaktı, bellekte büyütmenin
    // anlamı yok.
    if (error !== null) {
      queue = [];
    }
  } catch {
    queue = [];
  } finally {
    flushing = false;
  }
}

/** Uygulama açılışında bir kez çağrılır; düzenli boşaltmayı başlatır. */
export function startAnalytics(): () => void {
  if (!isSupabaseConfigured) return () => undefined;

  timer ??= setInterval(() => void flushAnalytics(), FLUSH_INTERVAL_MS);

  return () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    void flushAnalytics();
  };
}
