import Link from 'next/link';

import { contentMode } from '@/lib/content-source';

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
  { href: '/users', label: 'Kullanıcılar', ready: false },
  { href: '/analytics', label: 'Analitik', ready: false },
  { href: '/remote', label: 'Uzaktan kontrol', ready: false },
];

export function Shell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
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
      </nav>

      <main className="min-w-0 flex-1">
        <header className="mb-lg">
          <h1 className="text-title font-bold tracking-tight">{title}</h1>
          {description !== undefined && <p className="mt-1 text-fg-muted">{description}</p>}
        </header>

        {contentMode === 'embedded' && <EmbeddedNotice />}

        {children}
      </main>
    </div>
  );
}

/** Supabase bağlı değilken panelin ne gösterdiğini açıkça söyler. */
function EmbeddedNotice() {
  return (
    <div className="mb-lg rounded-lg border border-border bg-surface-sunken p-md">
      <p className="text-bodysmall font-semibold">Salt okunur — gömülü içerik</p>
      <p className="mt-1 text-bodysmall text-fg-muted">
        Supabase bağlantısı yapılandırılmamış. Panel şu an uygulamanın içine gömülü soru bankasını
        gösteriyor; düzenleme kapalı. <code className="text-caption">NEXT_PUBLIC_SUPABASE_URL</code>{' '}
        ve <code className="text-caption">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> tanımlandığında
        içerik veritabanından okunur ve düzenleme açılır.
      </p>
    </div>
  );
}
