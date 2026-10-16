import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase yapılandırılmamışsa panel yine açılır ve gömülü içeriği
 * salt okunur gösterir. Geliştirici ortam değişkenlerini doldurmadan
 * da paneli gezebilsin, mobil uygulamada olduğu gibi.
 */
function createAdminClient() {
  if (url === undefined || url.length === 0 || anonKey === undefined || anonKey.length === 0) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

export const supabase = createAdminClient();

export const isSupabaseConfigured = supabase !== null;
