import { createClient } from './auth';

/**
 * Segment kitle sayıları.
 *
 * Sayı veritabanında hesaplanıyor: kural zaten orada SQL'e
 * çevriliyor ve kampanyayı gönderen servis de aynı işlevi kullanıyor.
 * Panelde ayrıca hesaplasaydık, gösterilen sayı ile bildirimin
 * gittiği kitle sessizce ayrışabilirdi.
 *
 * İki ayrı sayı var ve ikisi de gerekli: `audience` kurala uyan
 * herkes, `reachable` onlardan bildirime izin vermiş olanlar.
 * Kampanyanın neden kitlesinden küçük gittiğini ancak ikisi birlikte
 * anlatıyor.
 *
 * Okunamayan sayı sıfır değil, yok: arayüz "—" gösteriyor.
 */

export type SegmentSize = {
  readonly audience: number;
  readonly reachable: number;
};

export type SegmentSizes = Readonly<Record<string, SegmentSize>>;

/** Hiçbir şey okunamadığında: her yer "—". */
export const NO_SIZES: SegmentSizes = {};

export async function fetchSegmentSizes(): Promise<SegmentSizes> {
  const supabase = await createClient();
  if (supabase === null) return NO_SIZES;

  const { data, error } = await supabase.rpc('admin_segment_sizes');
  if (error !== null || data === null) return NO_SIZES;

  const rows = data as { segment_id: string; audience: number; reachable: number }[];

  return Object.fromEntries(
    rows.map((row) => [row.segment_id, { audience: row.audience, reachable: row.reachable }]),
  );
}
