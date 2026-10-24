import { redirect } from 'next/navigation';

import { createClient, isAuthConfigured } from '@/lib/auth';

/**
 * Panel girişi.
 *
 * E-posta ve parola; Supabase Auth'un kendi oturumu. Kayıt yok —
 * yönetici hesabı veritabanından açılıyor, panelden değil. Panelde
 * "kaydol" olsaydı adresi bilen herkes hesap açabilirdi.
 */

export const metadata = { title: 'Giriş · NeuroPeak Yönetim Paneli' };

/**
 * Sayfa önden üretilemez: hem sorgu parametresini hem oturumu okuyor.
 * Next bunu kendiliğinden anlıyor ama uyarı veriyor; açıkça
 * bildirmek, uyarıyı gerçek bir sorunun habercisi olarak
 * okuyabilmemizi sağlıyor.
 */
export const instant = false;

async function signIn(formData: FormData) {
  'use server';

  const supabase = await createClient();
  if (supabase === null) redirect('/');

  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/');

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error !== null) {
    // Hangi kısmın yanlış olduğunu söylemiyoruz: hangi e-postanın
    // kayıtlı olduğunu da söylemiş olurduk.
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  redirect(next.startsWith('/') ? next : '/');
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!isAuthConfigured) redirect('/');

  const params = await searchParams;
  const failed = params.error !== undefined;
  const next = typeof params.next === 'string' ? params.next : '/';

  return (
    // Genişlik açık yazılı: tema `--spacing-sm` gibi adlandırılmış
    // boşluk jetonları tanımladığı için Tailwind'in `max-w-sm`i 12
    // piksele düşüyor, formu ince bir şeride sıkıştırıyor.
    <main className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center px-lg py-xl">
      <p className="text-caption font-medium text-brand">NeuroPeak</p>
      <h1 className="mb-lg text-title font-bold tracking-tight">Yönetim Paneli</h1>

      <form action={signIn} className="space-y-md rounded-lg border border-border bg-surface p-lg">
        <input type="hidden" name="next" value={next} />

        <div className="space-y-1">
          <label htmlFor="email" className="block text-bodysmall font-medium">
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-border bg-surface-sunken px-sm py-1.5 text-bodysmall"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-bodysmall font-medium">
            Parola
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-border bg-surface-sunken px-sm py-1.5 text-bodysmall"
          />
        </div>

        {failed && (
          <p role="alert" className="text-bodysmall text-danger">
            E-posta veya parola hatalı.
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-brand px-md py-2 text-bodysmall font-medium text-on-brand"
        >
          Giriş yap
        </button>
      </form>

      <p className="mt-md text-caption text-fg-muted">
        Yönetici hesabı veritabanından açılır; panelde kayıt yok.
      </p>
    </main>
  );
}
