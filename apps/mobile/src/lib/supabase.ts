import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import type { Database } from './database.types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase yapılandırılmamışsa uygulama çalışmaya devam eder: her şey
 * cihazda durur, senkronizasyon beklemeye alınır. Geliştirici ortam
 * değişkenlerini doldurmadan da uygulamayı açıp gezebilsin diye böyle.
 */
function createSupabaseClient() {
  if (url === undefined || url.length === 0 || anonKey === undefined || anonKey.length === 0) {
    return null;
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Mobilde URL'den oturum okunmaz; derin bağlantılar elle işlenir.
      detectSessionInUrl: false,
    },
  });
}

export const supabase = createSupabaseClient();

export const isSupabaseConfigured = supabase !== null;
