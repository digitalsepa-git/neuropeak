import { describe, expect, it } from 'vitest';

import {
  ACTIVATION_FUNNEL,
  ANALYTICS_EVENTS,
  countByEvent,
  funnel,
  retention,
  type AnalyticsRecord,
} from '../analytics/events';
import {
  DEFAULT_REMOTE_CONFIG,
  REMOTE_KEYS,
  experimentVariant,
  findRemoteKey,
  isValidRemoteValue,
  isVersionBelow,
  mergeRemoteConfig,
  remoteBoolean,
  remoteNumber,
  remoteString,
} from './config';

const DAY = 86_400_000;

function record(userId: string, name: AnalyticsRecord['name'], dayOffset: number): AnalyticsRecord {
  return { userId, name, at: new Date(Date.UTC(2026, 9, 1) + dayOffset * DAY) };
}

describe('uzaktan yapılandırma', () => {
  it('her anahtarın varsayılanı kendi tipine uyar', () => {
    for (const definition of REMOTE_KEYS) {
      expect(
        isValidRemoteValue(definition, definition.defaultValue),
        `${definition.key} varsayılanı geçersiz`,
      ).toBe(true);
    }
  });

  it('anahtar adları benzersiz', () => {
    const keys = REMOTE_KEYS.map((definition) => definition.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('geçerli değeri kabul eder', () => {
    const raw = { 'ads.enabled': true, 'paywall.trial_days': 7 };
    const merged = mergeRemoteConfig(raw);

    expect(merged['ads.enabled']).toBe(true);
    expect(merged['paywall.trial_days']).toBe(7);
  });

  it('yanlış tipte değeri varsayılana düşürür', () => {
    const merged = mergeRemoteConfig({ 'ads.enabled': 'evet', 'paywall.trial_days': 'üç' });

    expect(merged['ads.enabled']).toBe(DEFAULT_REMOTE_CONFIG['ads.enabled']);
    expect(merged['paywall.trial_days']).toBe(DEFAULT_REMOTE_CONFIG['paywall.trial_days']);
  });

  it('aralık dışındaki sayıyı varsayılana düşürür', () => {
    const merged = mergeRemoteConfig({ 'paywall.exit_discount': 500 });
    expect(merged['paywall.exit_discount']).toBe(DEFAULT_REMOTE_CONFIG['paywall.exit_discount']);
  });

  it('listede olmayan seçeneği varsayılana düşürür', () => {
    const merged = mergeRemoteConfig({ 'paywall.variant': 'uzay' });
    expect(merged['paywall.variant']).toBe('standard');
  });

  it('bilinmeyen anahtarı atar', () => {
    const merged = mergeRemoteConfig({ 'hiç.olmayan': 5 });
    expect(merged['hiç.olmayan']).toBeUndefined();
  });

  it('eksik anahtar varsayılanla doldurulur', () => {
    expect(Object.keys(mergeRemoteConfig({})).sort()).toEqual(
      Object.keys(DEFAULT_REMOTE_CONFIG).sort(),
    );
  });

  it('tipli okuyucular doğru değeri verir', () => {
    const config = mergeRemoteConfig({ 'paywall.title': 'Dene', 'paywall.trial_days': 5 });

    expect(remoteString(config, 'paywall.title')).toBe('Dene');
    expect(remoteNumber(config, 'paywall.trial_days')).toBe(5);
    expect(remoteBoolean(config, 'leagues.enabled')).toBe(true);
  });

  it('metin ezen anahtarların varsayılanı boş', () => {
    // Bu anahtarlar uygulamanın çevrilmiş metnini eziyor. Varsayılanı
    // bir cümle olsaydı, panelden hiçbir şey yazılmamışken bile her
    // dilde o tek dildeki cümle görünürdü — paywall başlığında tam
    // olarak bu olmuştu.
    for (const key of ['paywall.title']) {
      expect(DEFAULT_REMOTE_CONFIG[key]).toBe('');
    }
  });

  it('tanımsız anahtarda okuyucu güvenli değer döner', () => {
    expect(remoteString({}, 'yok.anahtar')).toBe('');
    expect(remoteNumber({}, 'yok.anahtar')).toBe(0);
    expect(remoteBoolean({}, 'yok.anahtar')).toBe(false);
  });

  it('anahtar tanımı bulunur', () => {
    expect(findRemoteKey('ads.enabled')?.type).toBe('boolean');
    expect(findRemoteKey('yok')).toBeUndefined();
  });
});

describe('A/B dağıtımı', () => {
  it('yüzde 0 ve 100 uçları kesin', () => {
    expect(experimentVariant('paywall', 'user-1', 0)).toBe('a');
    expect(experimentVariant('paywall', 'user-1', 100)).toBe('b');
  });

  it('aynı kullanıcı hep aynı kolda', () => {
    const first = experimentVariant('paywall', 'user-42', 50);
    for (let index = 0; index < 20; index += 1) {
      expect(experimentVariant('paywall', 'user-42', 50)).toBe(first);
    }
  });

  it('dağıtım orana yakın', () => {
    const users = Array.from({ length: 2000 }, (_, index) => `user-${index}`);
    const inB = users.filter((user) => experimentVariant('paywall', user, 30) === 'b').length;

    expect(inB / users.length).toBeGreaterThan(0.25);
    expect(inB / users.length).toBeLessThan(0.35);
  });

  it('iki deney aynı kullanıcıyı aynı yöne atmaz', () => {
    const users = Array.from({ length: 500 }, (_, index) => `user-${index}`);
    const same = users.filter(
      (user) => experimentVariant('a-deneyi', user, 50) === experimentVariant('b-deneyi', user, 50),
    ).length;

    // Bağımsız iki dağıtımda örtüşme yarıya yakın olmalı, hepsi değil.
    expect(same / users.length).toBeGreaterThan(0.35);
    expect(same / users.length).toBeLessThan(0.65);
  });
});

describe('sürüm karşılaştırma', () => {
  it('küçük sürümü yakalar', () => {
    expect(isVersionBelow('1.0.0', '1.2.0')).toBe(true);
    expect(isVersionBelow('1.2.0', '1.2.0')).toBe(false);
    expect(isVersionBelow('1.3.0', '1.2.0')).toBe(false);
  });

  it('eksik parçaları sıfır sayar', () => {
    expect(isVersionBelow('1.2', '1.2.1')).toBe(true);
    expect(isVersionBelow('2', '1.9.9')).toBe(false);
  });

  it('sayı olmayan parçayı sıfır sayar', () => {
    expect(isVersionBelow('1.x.0', '1.1.0')).toBe(true);
  });
});

describe('analitik', () => {
  it('olay adları benzersiz', () => {
    expect(new Set(ANALYTICS_EVENTS).size).toBe(ANALYTICS_EVENTS.length);
  });

  it('huni önceki adımları da şart koşar', () => {
    const records: AnalyticsRecord[] = [
      // İki kullanıcı açtı; biri kurulumu bitirdi.
      record('a', 'app_open', 0),
      record('b', 'app_open', 0),
      record('a', 'onboarding_complete', 0),
      // Bu kullanıcı paywall gördü ama kurulumu bitirmemiş: huniye girmemeli.
      record('b', 'paywall_view', 0),
    ];

    const result = funnel(ACTIVATION_FUNNEL, records);

    expect(result[0]?.users).toBe(2);
    expect(result[1]?.users).toBe(1);
    expect(result[4]?.users).toBe(0);
  });

  it('huni oranları ilk adıma göre', () => {
    const records = [record('a', 'app_open', 0), record('b', 'app_open', 0)];
    const result = funnel(ACTIVATION_FUNNEL, records);

    expect(result[0]?.ratio).toBe(1);
    expect(result[1]?.ratio).toBe(0);
  });

  it('boş veride huni çökmez', () => {
    expect(funnel(ACTIVATION_FUNNEL, []).every((step) => step.users === 0)).toBe(true);
  });

  it('tutundurma tam o günü arar', () => {
    const records: AnalyticsRecord[] = [
      record('a', 'app_open', 0),
      record('a', 'app_open', 1),
      record('b', 'app_open', 0),
      // Bu kullanıcı 2. gün döndü; 1. gün tutundurmasına girmemeli.
      record('c', 'app_open', 0),
      record('c', 'app_open', 2),
    ];

    const day1 = retention(records, 1);
    expect(day1.cohort).toBe(3);
    expect(day1.returned).toBe(1);

    const day2 = retention(records, 2);
    expect(day2.returned).toBe(1);
  });

  it('boş veride tutundurma sıfır', () => {
    expect(retention([], 1)).toEqual({ cohort: 0, returned: 0, ratio: 0 });
  });

  it('olay sayımı bütün olayları listeler', () => {
    const counts = countByEvent([record('a', 'app_open', 0), record('b', 'app_open', 0)]);

    expect(counts).toHaveLength(ANALYTICS_EVENTS.length);
    expect(counts.find((item) => item.name === 'app_open')?.count).toBe(2);
    expect(counts.find((item) => item.name === 'ad_watched')?.count).toBe(0);
  });
});
