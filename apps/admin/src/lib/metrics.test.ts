import { describe, expect, it } from 'vitest';

import { toFunnelRows } from './metrics';

/**
 * Huni sıralaması ve oranları saf; toplamların kendisi
 * veritabanında hesaplanıyor ve orada test ediliyor
 * (supabase/tests/01_rls_assertions.sql).
 */

describe('toFunnelRows', () => {
  it('adımları katalogdaki sırayla veriyor', () => {
    const rows = toFunnelRows([
      { event: 'purchase_complete', users: 1 },
      { event: 'app_open', users: 10 },
    ]);

    expect(rows.map((row) => row.event)).toEqual([
      'app_open',
      'onboarding_complete',
      'test_complete',
      'game_complete',
      'paywall_view',
      'purchase_complete',
    ]);
  });

  it('oranı ilk adıma göre hesaplıyor', () => {
    const rows = toFunnelRows([
      { event: 'app_open', users: 10 },
      { event: 'onboarding_complete', users: 5 },
    ]);

    expect(rows[0]?.ratio).toBe(1);
    expect(rows[1]?.ratio).toBe(0.5);
  });

  it('gelmeyen adımı sıfır sayıyor', () => {
    const rows = toFunnelRows([{ event: 'app_open', users: 10 }]);
    expect(rows[5]?.users).toBe(0);
    expect(rows[5]?.ratio).toBe(0);
  });

  it('ilk adım sıfırken oranı sıfır bırakıyor', () => {
    // Bölme tanımsız; "kimse geçmedi" demek, kimse girmemişken
    // yanıltıcı olurdu.
    const rows = toFunnelRows([
      { event: 'app_open', users: 0 },
      { event: 'onboarding_complete', users: 0 },
    ]);

    expect(rows.every((row) => row.ratio === 0)).toBe(true);
  });

  it('hiç satır gelmediğinde yapı yine duruyor', () => {
    const rows = toFunnelRows([]);
    expect(rows).toHaveLength(6);
    expect(rows.every((row) => row.users === 0)).toBe(true);
  });
});
