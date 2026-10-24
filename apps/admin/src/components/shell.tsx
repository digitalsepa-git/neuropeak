import Link from 'next/link';

import { currentSession } from '@/lib/auth';
import { contentMode } from '@/lib/content-mode';

/**
 * Panel kabuğu: solda modül menüsü, üstte başlık. Hazır olmayan
 * modüller menüde görünür ama bağlantı değil — yol haritası görünsün,
 * boş sayfa açılmasın.
 */

type NavItem = {
  readonly href: string;
  readonly label: string;
  readonly ready: boolean;
};

const NAV: readonly NavItem[] = [
  { href: '/', label: 'Genel bakış', ready: true },
  { href: '/content/tests', label: 'Testler', ready: true },
  { href: '/content/games', label: 'Oyunlar', ready: true },
  { href: '/content/badges', label: 'Rozetler', ready: true },
  { href: '/content/tasks', label: 'Günlük görevler', ready: true },
  { href: '/users', label: 'Kullanıcılar', ready: true },
  { href: '/users/push', label: 'Push', ready: true },
  { href: '/analytics', label: 'Analitik', ready: true },
  { href: '/remote', label: 'Uzaktan kontrol', ready: true },
];

export async function Shell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const session = await currentSession();

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-xl px-lg py-xl">
      <nav aria-label="Modüller" className="hidden w-52 shrink-0 md:block">
        <p className="text-caption font-medium text-brand">NeuroPeak</p>
        <p className="mb-md text-bodysmall text-fg-muted">Yönetim Paneli</p>

        <ul className="space-y-0.5">
          {NAV.map((item) =>
            item.ready ? (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-sm py-1.5 text-bodysmall hover:bg-surface"
                >
                  {item.label}
                </Link>
              </li>
            ) : (
              <li
                key={item.href}
                className="flex items-center justify-between rounded-md px-sm py-1.5 text-bodysmall text-fg-subtle"
              >
                {item.label}
                <span className="rounded-pill bg-surface-sunken px-1.5 text-overline font-semibold tracking-wide text-fg-muted uppercase">
                  Yakında
                </span>
              </li>
            ),
          )}
        </ul>

        {session !== null && <SessionBox email={session.email} isAdmin={session.isAdmin} />}
      </nav>

      <main className="min-w-0 flex-1">
        <header className="mb-lg">
          <h1 className="text-title font-bold tracking-tight">{title}</h1>
          {description !== undefined && <p className="mt-1 text-fg-muted">{description}</p>}
        </header>

        {contentMode === 'embedded' && <EmbeddedNotice />}
        {session !== null && !session.isAdmin && <NotAdminNotice />}

        {children}
      </main>
    </div>
  );
}

function SessionBox({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  return (
    <div className="mt-lg border-t border-border pt-md">
      <p className="truncate text-caption text-fg-muted" title={email}>
        {email}
      </p>
      {!isAdmin && <p className="mt-0.5 text-caption text-fg-subtle">Yönetici değil</p>}
      <form action="/auth/sign-out" method="post">
        <button type="submit" className="mt-xs text-caption text-brand hover:underline">
          Çıkış yap
        </button>
      </form>
    </div>
  );
}

/**
 * Girişi olan ama yönetici olmayan kullanıcı.
 *
 * Yetki veritabanında: bu kullanıcının içerik sorguları boş döner.
 * Sayfayı gizlemek yerine neden boş olduğunu söylüyoruz — sessizce
 * boş bir panel, bozuk bir panelden ayırt edilemez.
 */
function NotAdminNotice() {
  return (
    <div className="mb-lg rounded-lg border border-border bg-surface-sunken p-md">
      <p className="text-bodysmall font-semibold">Bu hesap yönetici değil</p>
      <p className="mt-1 text-bodysmall text-fg-muted">
        Giriş yapıldı ama hesap <code className="text-caption">admins</code> listesinde değil. Canlı
        veriden okunan bölümler boş görünecek; yetki veritabanından verilir.
      </p>
    </div>
  );
}

/** Supabase bağlı değilken panelin ne gösterdiğini açıkça söyler. */
function EmbeddedNotice() {
  return (
    <div className="mb-lg rounded-lg border border-border bg-surface-sunken p-md">
      <p className="text-bodysmall font-semibold">Salt okunur — bağlantı yok</p>
      <p className="mt-1 text-bodysmall text-fg-muted">
        Supabase bağlantısı yapılandırılmamış. İçerik uygulamaya gömülü bankadan gösteriliyor;
        kullanıcı verisi, kitle sayıları ve gönderim kapalı.{' '}
        <code className="text-caption">NEXT_PUBLIC_SUPABASE_URL</code> ve{' '}
        <code className="text-caption">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> tanımlandığında hepsi
        açılır.
      </p>
    </div>
  );
}
