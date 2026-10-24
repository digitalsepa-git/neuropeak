'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/auth';
import { canEditContent } from '@/lib/content-mode';
import {
  parseBadge,
  parseDailyTask,
  parseCampaign,
  parseGame,
  parseQuestion,
  parseTest,
  type FormValues,
} from '@/lib/content-edit';

/**
 * İçerik düzenleme eylemleri.
 *
 * Yazma hakkı RLS'te: yönetici olmayan bir hesabın güncellemesi
 * sıfır satır etkiliyor, hata vermiyor. Bu yüzden her eylem
 * güncellenen satırı geri istiyor ve dönmezse bunu söylüyor —
 * sessizce "kaydedildi" demek, kaydedilmemiş bir değişikliği
 * kaydedilmiş sanmak demek.
 */

export type ActionState = {
  readonly status: 'idle' | 'saved' | 'error';
  readonly message?: string;
};

export const IDLE: ActionState = { status: 'idle' };

function toValues(formData: FormData): FormValues {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') values[key] = value;
  }
  return values;
}

async function save(
  table: 'daily_task_templates' | 'badges' | 'games' | 'tests',
  id: string,
  patch: Record<string, unknown>,
  path: string,
): Promise<ActionState> {
  const supabase = await createClient();
  if (supabase === null) {
    return { status: 'error', message: 'Veritabanı bağlı değil.' };
  }

  // `select` olmadan kaç satırın etkilendiğini öğrenemiyoruz; RLS
  // engellediğinde hata değil boş sonuç dönüyor.
  const { data, error } = await supabase.from(table).update(patch).eq('id', id).select('id');

  if (error !== null) {
    return { status: 'error', message: `Kaydedilemedi: ${error.message}` };
  }

  if (data === null || data.length === 0) {
    return {
      status: 'error',
      message: 'Kaydedilemedi: bu hesabın yazma yetkisi yok ya da kayıt bulunamadı.',
    };
  }

  revalidatePath(path);
  return { status: 'saved' };
}

export async function updateDailyTask(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!canEditContent) return { status: 'error', message: 'Bağlantı yokken düzenleme kapalı.' };

  const parsed = parseDailyTask(toValues(formData));
  if (!parsed.ok) return { status: 'error', message: parsed.message };

  const { id, ...patch } = parsed.value;
  return save('daily_task_templates', id, patch, '/content/tasks');
}

export async function updateBadge(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!canEditContent) return { status: 'error', message: 'Bağlantı yokken düzenleme kapalı.' };

  const parsed = parseBadge(toValues(formData));
  if (!parsed.ok) return { status: 'error', message: parsed.message };

  const { id, ...patch } = parsed.value;
  return save('badges', id, patch, '/content/badges');
}

/**
 * Soru güncellemesi.
 *
 * Diğerlerinden farkı anahtar: soruların birincil anahtarı uuid,
 * içerikteki kalıcı kimlik `slug` sütununda. Panel slug'ı
 * gösteriyor, güncelleme de onunla eşleşiyor.
 *
 * Soru havuzu paylaşımlı: bir soruyu değiştirmek onu kullanan
 * bütün testleri etkiliyor. Bu yüzden yalnızca soruyu gösteren
 * sayfa değil, test listesi de tazeleniyor.
 */
export async function updateQuestion(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!canEditContent) return { status: 'error', message: 'Bağlantı yokken düzenleme kapalı.' };

  const parsed = parseQuestion(toValues(formData));
  if (!parsed.ok) return { status: 'error', message: parsed.message };

  const { slug, ...patch } = parsed.value;

  const supabase = await createClient();
  if (supabase === null) {
    return { status: 'error', message: 'Veritabanı bağlı değil.' };
  }

  const { data, error } = await supabase
    .from('questions')
    .update(patch)
    .eq('slug', slug)
    .select('slug');

  if (error !== null) {
    return { status: 'error', message: `Kaydedilemedi: ${error.message}` };
  }

  if (data === null || data.length === 0) {
    return {
      status: 'error',
      message: 'Kaydedilemedi: bu hesabın yazma yetkisi yok ya da soru bulunamadı.',
    };
  }

  revalidatePath('/content/tests', 'layout');
  return { status: 'saved' };
}

/**
 * Oyun üst bilgisi.
 *
 * Kip formda değil çünkü düzenlenmiyor; ama `total_levels`
 * doğrulaması kipe bağlı, bu yüzden gizli alan olarak geliyor.
 * İstemciden gelen bir değere bakmak hoş değil ama kipin kendisi
 * yazılmıyor: yanlış gelse bile en fazla yanlış hata mesajı
 * çıkar, veritabanı kısıtı son sözü söylüyor.
 */
export async function updateGame(_previous: ActionState, formData: FormData): Promise<ActionState> {
  if (!canEditContent) return { status: 'error', message: 'Bağlantı yokken düzenleme kapalı.' };

  const values = toValues(formData);
  const mode = values.mode === 'timed' ? 'timed' : 'levels';

  const parsed = parseGame(values, mode);
  if (!parsed.ok) return { status: 'error', message: parsed.message };

  const { id, ...patch } = parsed.value;
  return save('games', id, patch, '/content/games');
}

/**
 * Test üst bilgisi.
 *
 * Havuz boyutu doğrulamaya gerekiyor ve istemciden geliyor; yanlış
 * gelse bile yazılan bir alan değil, yalnızca "havuzdan fazla soru
 * sorulamaz" kontrolünü etkiliyor. Havuzu sunucuda yeniden saymak
 * daha güvenli olurdu ama soruları ayrıca çekmek gerekirdi; bu
 * kontrol kullanıcıyı uyarmak için, bir güvenlik sınırı değil.
 */
export async function updateTest(_previous: ActionState, formData: FormData): Promise<ActionState> {
  if (!canEditContent) return { status: 'error', message: 'Bağlantı yokken düzenleme kapalı.' };

  const values = toValues(formData);
  const poolSize = Number(values.pool_size ?? '0');

  const parsed = parseTest(values, Number.isFinite(poolSize) ? poolSize : 0);
  if (!parsed.ok) return { status: 'error', message: parsed.message };

  const { id, ...patch } = parsed.value;
  return save('tests', id, patch, '/content/tests');
}

/**
 * Push kampanyasını taslak olarak kaydeder.
 *
 * Gönderme değil kaydetme: kampanyayı gerçekten yollayacak servis
 * henüz yok (dağıtılmış bir Edge Function istiyor). Taslak
 * saklamak yine de işe yarıyor — metin iki dilde hazırlanıyor,
 * kitle seçiliyor ve kayıt duruyor.
 *
 * Durum `draft`te bırakılıyor; `sending`e geçirmek gönderen
 * servisin işi, panelin değil.
 */
export async function saveCampaign(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!canEditContent) return { status: 'error', message: 'Bağlantı yokken kayıt kapalı.' };

  const values = toValues(formData);
  const parsed = parseCampaign(values);
  if (!parsed.ok) return { status: 'error', message: parsed.message };

  const supabase = await createClient();
  if (supabase === null) {
    return { status: 'error', message: 'Veritabanı bağlı değil.' };
  }

  const { data, error } = await supabase.from('push_campaigns').insert(parsed.value).select('id');

  if (error !== null) {
    return { status: 'error', message: `Kaydedilemedi: ${error.message}` };
  }

  if (data === null || data.length === 0) {
    return {
      status: 'error',
      message: 'Kaydedilemedi: bu hesabın yazma yetkisi yok.',
    };
  }

  revalidatePath('/users/push');
  return { status: 'saved' };
}
