import { contentMode } from '@/lib/content-mode';

/**
 * Canlı modda boş dönen liste.
 *
 * İki sebebi olabilir ve ikisi de sessiz kalırsa panel bozuk
 * görünür: hesap yönetici değildir (RLS boş döndürür) ya da içerik
 * henüz veritabanına yazılmamıştır. Hangisi olduğunu buradan
 * bilemeyiz, ama ikisini de söyleyebiliriz.
 */
export function EmptyContent({ what }: { what: string }) {
  if (contentMode !== 'live') return null;

  return (
    <div className="rounded-lg border border-border bg-surface-sunken p-lg">
      <p className="text-bodysmall font-semibold">{what} bulunamadı</p>
      <p className="mt-1 text-bodysmall text-fg-muted">
        Veritabanı bağlı ama sorgu boş döndü. Ya bu hesap yönetici değil, ya da içerik henüz
        yazılmadı — <code className="text-caption">npm run db:seed</code> bunu yapar.
      </p>
    </div>
  );
}
