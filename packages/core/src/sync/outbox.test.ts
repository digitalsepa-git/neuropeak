import { describe, expect, it } from 'vitest';

import {
  MAX_ATTEMPTS,
  MAX_QUEUE_SIZE,
  backoffMs,
  dueItems,
  enqueue,
  markFailed,
  markSucceeded,
  type OutboxItem,
} from './outbox';

const NOW = 1_000_000;

function queueWith(count: number): OutboxItem[] {
  let queue: OutboxItem[] = [];
  for (let index = 0; index < count; index += 1) {
    queue = enqueue(queue, { id: `id-${index}`, kind: 'game_session', payload: index }, NOW);
  }
  return queue;
}

describe('enqueue', () => {
  it('kaydı sıfır denemeyle hemen gönderilecek şekilde ekler', () => {
    const queue = enqueue([], { id: 'a', kind: 'game_session', payload: { score: 10 } }, NOW);

    expect(queue).toHaveLength(1);
    expect(queue[0]?.attempts).toBe(0);
    expect(queue[0]?.nextAttemptAt).toBe(NOW);
  });

  it('aynı dedupeKey ile gelen kayıt öncekinin yerine geçer', () => {
    let queue = enqueue(
      [],
      { id: 'a', kind: 'game_progress', payload: { level: 1 }, dedupeKey: 'card-match' },
      NOW,
    );
    queue = enqueue(
      queue,
      { id: 'b', kind: 'game_progress', payload: { level: 2 }, dedupeKey: 'card-match' },
      NOW + 10,
    );

    expect(queue).toHaveLength(1);
    expect(queue[0]?.payload).toEqual({ level: 2 });
  });

  it('farklı türdeki aynı anahtarı ayrı tutar', () => {
    let queue = enqueue([], { id: 'a', kind: 'game_progress', payload: 1, dedupeKey: 'x' }, NOW);
    queue = enqueue(queue, { id: 'b', kind: 'brain_map', payload: 2, dedupeKey: 'x' }, NOW);

    expect(queue).toHaveLength(2);
  });

  it('anahtarsız kayıtlar birikir — her oynanış ayrı gönderilir', () => {
    let queue = enqueue([], { id: 'a', kind: 'game_session', payload: 1 }, NOW);
    queue = enqueue(queue, { id: 'b', kind: 'game_session', payload: 2 }, NOW);

    expect(queue).toHaveLength(2);
  });

  it('kuyruk taşınca en eski kayıtları düşürür', () => {
    const queue = queueWith(MAX_QUEUE_SIZE + 5);

    expect(queue).toHaveLength(MAX_QUEUE_SIZE);
    expect(queue[0]?.id).toBe('id-5');
  });
});

describe('dueItems', () => {
  it('yalnızca zamanı gelenleri döndürür', () => {
    let queue = enqueue([], { id: 'a', kind: 'k', payload: 1 }, NOW);
    queue = markFailed(queue, 'a', NOW);

    expect(dueItems(queue, NOW)).toHaveLength(0);
    expect(dueItems(queue, NOW + backoffMs(1))).toHaveLength(1);
  });
});

describe('markFailed', () => {
  it('denemeyi artırır ve bir sonrakini erteler', () => {
    let queue = enqueue([], { id: 'a', kind: 'k', payload: 1 }, NOW);
    queue = markFailed(queue, 'a', NOW);

    expect(queue[0]?.attempts).toBe(1);
    expect(queue[0]?.nextAttemptAt).toBe(NOW + 2_000);
  });

  it('deneme hakkı bitince kaydı düşürür', () => {
    let queue = enqueue([], { id: 'a', kind: 'k', payload: 1 }, NOW);
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      queue = markFailed(queue, 'a', NOW);
    }

    expect(queue).toHaveLength(0);
  });

  it('diğer kayıtlara dokunmaz', () => {
    let queue = enqueue([], { id: 'a', kind: 'k', payload: 1 }, NOW);
    queue = enqueue(queue, { id: 'b', kind: 'k', payload: 2 }, NOW);
    queue = markFailed(queue, 'a', NOW);

    expect(queue.find((item) => item.id === 'b')?.attempts).toBe(0);
  });
});

describe('markSucceeded', () => {
  it('kaydı kuyruktan çıkarır', () => {
    let queue = enqueue([], { id: 'a', kind: 'k', payload: 1 }, NOW);
    queue = enqueue(queue, { id: 'b', kind: 'k', payload: 2 }, NOW);

    expect(markSucceeded(queue, 'a').map((item) => item.id)).toEqual(['b']);
  });
});

describe('backoffMs', () => {
  it('üstel artar ve tavanda durur', () => {
    expect(backoffMs(0)).toBe(0);
    expect(backoffMs(1)).toBe(2_000);
    expect(backoffMs(2)).toBe(4_000);
    expect(backoffMs(3)).toBe(8_000);
    expect(backoffMs(99)).toBe(30 * 60 * 1000);
  });
});
