import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { AppLanguage } from '@neuropeak/core';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

/**
 * Push jetonu kaydı.
 *
 * Bildirim göndermenin ilk halkası: cihazın jetonu olmadan kampanya
 * kimseye ulaşmıyor. Jeton `push_tokens` tablosunda duruyor ve
 * kullanıcı bildirimi kapatınca satır silinmiyor, pasife alınıyor —
 * hangi cihazın ne zaman izin verdiğini kaybetmemek için; şema da
 * bunu böyle tarif ediyor.
 *
 * Kullanıcı bildirimi açmadan izin istenmiyor. Uygulama açılır
 * açılmaz izin sormak, çoğu kişinin reddettiği ve bir daha
 * sorulamayan bir karar; tercih açıkça yapıldığında soruluyor.
 */

const PREFERENCE_KEY = 'neuropeak.notifications.enabled';

export async function readPreference(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(PREFERENCE_KEY)) === 'true';
  } catch {
    return false;
  }
}

async function writePreference(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFERENCE_KEY, enabled ? 'true' : 'false');
  } catch {
    // Yazılamazsa tercih oturum içinde geçerli; bir sonraki açılışta
    // kapalı görünür ve kullanıcı yeniden açabilir.
  }
}

export type PushOutcome = 'enabled' | 'denied' | 'unsupported' | 'notConfigured' | 'failed';

/**
 * Jetonu alır.
 *
 * Hata türünü deneyerek ayırıyoruz. Önceden anlamak için
 * `expo-device` eklemek gerekiyordu — tek bir boolean için yeni bir
 * yerel modül, üstelik mevcut geliştirme derlemesinde olmadığı için
 * uygulamayı açılışta düşüren bir modül.
 *
 * İki ayrı başarısızlık var ve kullanıcıya söylenecek şey farklı:
 *
 *   notConfigured — derlemede `aps-environment` yetkilendirmesi yok.
 *     Simülatörde de bu çıkıyor ama asıl anlamı yapılandırma eksiği;
 *     gerçek cihazda da jeton alınamaz. Bunu "cihaz desteklemiyor"
 *     diye göstermek sorunu yanlış yere yazardı.
 *   unsupported — jeton gerçek bir cihaz kaydı istiyor.
 */
function classify(error: unknown): PushOutcome {
  const message = error instanceof Error ? error.message : String(error);

  if (/aps-environment|entitlement/i.test(message)) return 'notConfigured';
  if (/simulator|emulator|physical device/i.test(message)) return 'unsupported';
  return 'failed';
}

async function requestToken(): Promise<{ outcome: PushOutcome; token?: string }> {
  try {
    const existing = await Notifications.getPermissionsAsync();
    const granted =
      existing.granted ||
      (await Notifications.requestPermissionsAsync().then((result) => result.granted));

    if (!granted) return { outcome: 'denied' };

    const token = await Notifications.getExpoPushTokenAsync();
    return { outcome: 'enabled', token: token.data };
  } catch (error) {
    return { outcome: classify(error) };
  }
}

/**
 * Bildirimleri açar: izin ister, jetonu alır ve kaydeder.
 *
 * Supabase bağlı değilse tercih yine saklanıyor — kullanıcının
 * seçimi, sunucunun hazır olmasına bağlı değil — ama jeton
 * yazılamıyor.
 */
export async function enableNotifications(language: AppLanguage): Promise<PushOutcome> {
  const { outcome, token } = await requestToken();
  if (outcome !== 'enabled' || token === undefined) return outcome;

  await writePreference(true);

  if (!isSupabaseConfigured || supabase === null) return 'enabled';

  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (userId === undefined) return 'enabled';

  try {
    await supabase.from('push_tokens').upsert(
      {
        user_id: userId,
        token,
        platform: Platform.OS === 'android' ? 'android' : 'ios',
        locale: language,
        is_active: true,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,token' },
    );
  } catch {
    // Jeton yazılamadıysa tercih açık kalıyor; bir sonraki açılışta
    // yeniden denenecek.
  }

  return 'enabled';
}

/**
 * Bildirimleri kapatır.
 *
 * Jeton satırı silinmiyor, pasife alınıyor: kullanıcı yeniden
 * açarsa aynı cihaz tanınıyor ve izin geçmişi duruyor.
 */
export async function disableNotifications(): Promise<void> {
  await writePreference(false);

  if (!isSupabaseConfigured || supabase === null) return;

  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (userId === undefined) return;

  try {
    await supabase.from('push_tokens').update({ is_active: false }).eq('user_id', userId);
  } catch {
    // Sunucu bilmese de uygulama bildirim göstermeyecek; bir sonraki
    // açılışta yeniden denenir.
  }
}
