import { isSupabaseConfigured } from './supabase';

/**
 * Panelin hangi kaynaktan okuduğu.
 *
 * `content-source.ts`ten ayrı duruyor çünkü bunu istemci
 * bileşenleri de okuyor (tablolar "düzenleme kapalı" diye yazıyor).
 * `content-source` sunucuya özgü koda — oturum çerezlerine —
 * zincirleniyor; aynı dosyada olsalardı o zincir istemci paketine
 * girer ve derleme düşerdi.
 */

export type ContentMode = 'live' | 'embedded';

export const contentMode: ContentMode = isSupabaseConfigured ? 'live' : 'embedded';

export const canEditContent = contentMode === 'live';
