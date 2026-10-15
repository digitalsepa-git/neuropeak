/**
 * Giden kutusu: uygulama çevrimdışıyken veya sunucuya ulaşılamazken
 * biriken değişiklikler. Saf veri yapısı olarak tutulur — depolama ve ağ
 * çağrısı uygulama katmanının işi, buradaki kurallar test edilebilir.
 */

export type OutboxItem<TPayload = unknown> = {
  readonly id: string;
  readonly kind: string;
  readonly payload: TPayload;
  /**
   * Aynı anahtarı taşıyan bekleyen bir kayıt varsa yenisi onun yerine geçer.
   * Üzerine yazılan kayıtlar (ilerleme, onboarding cevapları) için; her
   * oynanışın ayrı kaydedildiği olaylar için boş bırakılır.
   */
  readonly dedupeKey?: string;
  readonly createdAt: number;
  readonly attempts: number;
  readonly nextAttemptAt: number;
};

/** Bu kadar denemeden sonra kayıt düşürülür. */
export const MAX_ATTEMPTS = 8;

/** Kuyrukta en fazla bu kadar kayıt tutulur; en eskiler düşürülür. */
export const MAX_QUEUE_SIZE = 500;

const BASE_BACKOFF_MS = 2_000;
const MAX_BACKOFF_MS = 30 * 60 * 1000;

/** Üstel geri çekilme: 2sn, 4sn, 8sn… en çok 30 dakika. */
export function backoffMs(attempts: number): number {
  if (attempts <= 0) return 0;
  const raw = BASE_BACKOFF_MS * 2 ** (attempts - 1);
  return Math.min(raw, MAX_BACKOFF_MS);
}

export type NewOutboxItem<TPayload = unknown> = {
  id: string;
  kind: string;
  payload: TPayload;
  dedupeKey?: string;
};

/**
 * Kuyruğa ekler. Aynı dedupeKey'li bekleyen kayıt varsa onun yerine geçer,
 * böylece aynı satırın on kez yazılması yerine yalnızca son hâli gönderilir.
 */
export function enqueue(
  queue: readonly OutboxItem[],
  item: NewOutboxItem,
  now: number,
): OutboxItem[] {
  const fresh: OutboxItem = {
    id: item.id,
    kind: item.kind,
    payload: item.payload,
    ...(item.dedupeKey !== undefined && { dedupeKey: item.dedupeKey }),
    createdAt: now,
    attempts: 0,
    nextAttemptAt: now,
  };

  const withoutDuplicate =
    item.dedupeKey === undefined
      ? [...queue]
      : queue.filter(
          (existing) => existing.kind !== item.kind || existing.dedupeKey !== item.dedupeKey,
        );

  const next = [...withoutDuplicate, fresh];

  // Taşma durumunda en eski kayıtlar düşer: yeni veri eskisinden değerli.
  return next.length > MAX_QUEUE_SIZE ? next.slice(next.length - MAX_QUEUE_SIZE) : next;
}

/** Gönderme zamanı gelmiş kayıtlar, eklenme sırasıyla. */
export function dueItems(queue: readonly OutboxItem[], now: number): OutboxItem[] {
  return queue.filter((item) => item.nextAttemptAt <= now);
}

export function markSucceeded(queue: readonly OutboxItem[], id: string): OutboxItem[] {
  return queue.filter((item) => item.id !== id);
}

/**
 * Başarısız denemeyi işler: sayacı artırır ve bir sonraki denemeyi erteler.
 * Deneme hakkı biten kayıt kuyruktan düşer — sonsuza kadar denenmez.
 */
export function markFailed(queue: readonly OutboxItem[], id: string, now: number): OutboxItem[] {
  return queue.flatMap((item) => {
    if (item.id !== id) return [item];

    const attempts = item.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) return [];

    return [{ ...item, attempts, nextAttemptAt: now + backoffMs(attempts) }];
  });
}

/** Kuyruğun gönderilmeyi bekleyen kayıt sayısı. */
export function pendingCount(queue: readonly OutboxItem[]): number {
  return queue.length;
}
