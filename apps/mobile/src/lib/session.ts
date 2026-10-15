import { isSupabaseConfigured, supabase } from './supabase';

/**
 * Hesap isteğe bağlıdır: uygulama ilk açılışta anonim oturum açar, böylece
 * kullanıcıdan hiçbir şey istemeden ilerleme buluta yazılabilir. Kullanıcı
 * sonradan Apple veya Google ile bağlanırsa aynı kullanıcı kimliği kalıcı
 * hesaba dönüşür ve veriler korunur (PR#7 ve sonrası).
 */
export async function ensureSession(): Promise<string | null> {
  if (!isSupabaseConfigured || supabase === null) {
    return null;
  }

  try {
    const { data } = await supabase.auth.getSession();
    if (data.session !== null) {
      return data.session.user.id;
    }

    const { data: signedIn, error } = await supabase.auth.signInAnonymously();
    if (error !== null) {
      return null;
    }

    return signedIn.user?.id ?? null;
  } catch {
    // Ağ yoksa oturum bir sonraki açılışta açılır; uygulama çevrimdışı çalışır.
    return null;
  }
}

export async function getUserId(): Promise<string | null> {
  if (!isSupabaseConfigured || supabase === null) {
    return null;
  }

  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
  } catch {
    return null;
  }
}
