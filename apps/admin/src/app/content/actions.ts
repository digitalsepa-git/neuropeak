'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/auth';
import { canEditContent } from '@/lib/content-mode';
import { parseBadge, parseDailyTask, type FormValues } from '@/lib/content-edit';

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
  table: 'daily_task_templates' | 'badges',
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
