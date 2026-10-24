import { describe, expect, it } from 'vitest';

import { apsEnvironmentFor } from './aps';

describe('apsEnvironmentFor', () => {
  it('yerel derlemede sandbox', () => {
    expect(apsEnvironmentFor(undefined)).toBe('development');
  });

  it('geliştirme profilinde sandbox', () => {
    expect(apsEnvironmentFor('development')).toBe('development');
  });

  it('TestFlight ve mağaza derlemesinde üretim', () => {
    expect(apsEnvironmentFor('production')).toBe('production');
  });

  it('iç dağıtım derlemesinde de üretim', () => {
    // `preview` ad hoc dağıtım; ad hoc profiller üretim APNs'ini
    // kullanıyor, sandbox'ı yalnızca geliştirme profili kullanıyor.
    expect(apsEnvironmentFor('preview')).toBe('production');
  });

  it('tanımadığı profilde üretim varsayıyor', () => {
    // Yeni bir profil eklenirse sessizce sandbox'a düşmesin:
    // sandbox'ın hatası görünmez, üretimin hatası derlemede çıkar.
    expect(apsEnvironmentFor('staging')).toBe('production');
  });
});
