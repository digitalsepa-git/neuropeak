import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Panelin oturumu.
 *
 * Panel service_role anahtarı taşımıyor: yöneticinin kendi oturumuyla
 * konuşuyor, yetki de RLS'te yazılı (`public.is_admin()`). Böylece
 * panele giren biri veritabanının tamamına değil, yöneticinin hakkı
 * olan satırlara erişiyor ve yetki kuralı tek yerde duruyor.
 *
 * Supabase yapılandırılmamışsa oturum diye bir şey yok: panel gömülü
 * içeriği salt okunur gösteriyor ve giriş istemiyor. Geliştirici
 * ortam değişkenlerini doldurmadan da paneli gezebilsin.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isAuthConfigured =
  url !== undefined && url.length > 0 && anonKey !== undefined && anonKey.length > 0;

export async function createClient() {
  if (!isAuthConfigured) return null;

  const store = await cookies();

  return createServerClient(url as string, anonKey as string, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        // Sunucu bileşeninden çağrıldığında çerez yazılamaz; oturumu
        // middleware tazeliyor, bu yüzden burada sessizce geçiliyor.
        try {
          for (const { name, value, options } of toSet) store.set(name, value, options);
        } catch {
          // Sunucu bileşeni; middleware hallediyor.
        }
      },
    },
  });
}

export type AdminSession = {
  readonly email: string;
  readonly isAdmin: boolean;
};

/**
 * Giriş yapmış kullanıcı ve yönetici olup olmadığı.
 *
 * Yöneticilik `admins` tablosundan okunuyor, JWT'den değil: yetki
 * verildiği anda geçerli olsun, kullanıcının jetonu yenilenene kadar
 * beklemesin.
 */
export async function currentSession(): Promise<AdminSession | null> {
  const supabase = await createClient();
  if (supabase === null) return null;

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (user === null) return null;

  const { data: row } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  return { email: user.email ?? '', isAdmin: row !== null };
}
