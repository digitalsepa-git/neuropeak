import { seedFromString } from '../random';

/**
 * Uzaktan yapılandırma.
 *
 * Uygulama güncellemesi beklemeden değişmesi gereken şeyler: paywall
 * metni, fiyat varyantı, özellik anahtarları, zorunlu sürüm. Panelden
 * yazılır, uygulama açılışta okur.
 *
 * Buradaki sözleşme iki yönlü: panel hangi anahtarların olduğunu ve ne
 * tip değer aldığını bu listeden öğreniyor, uygulama da okuduğu değeri
 * buna göre doğruluyor. Sunucudan bozuk ya da bilinmeyen bir değer
 * gelirse varsayılana düşülüyor — uzaktan yapılan bir hata uygulamayı
 * çökertmemeli.
 */

export type RemoteValue = string | number | boolean;

export type RemoteKeyDefinition = {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly type: 'string' | 'number' | 'boolean';
  readonly defaultValue: RemoteValue;
  /** Sayısal anahtarlarda kabul edilen aralık. */
  readonly min?: number;
  readonly max?: number;
  /** Metin anahtarlarında kabul edilen değerler. */
  readonly options?: readonly string[];
};

export const REMOTE_KEYS: readonly RemoteKeyDefinition[] = [
  {
    key: 'paywall.variant',
    label: 'Paywall varyantı',
    description: 'Hangi paywall düzeninin gösterileceği.',
    type: 'string',
    defaultValue: 'standard',
    options: ['standard', 'compact', 'story'],
  },
  {
    key: 'paywall.title',
    label: 'Paywall başlığı',
    description: 'Paywall ekranının üst başlığı.',
    type: 'string',
    defaultValue: 'Potansiyelini aç',
  },
  {
    key: 'paywall.trial_days',
    label: 'Deneme süresi (gün)',
    description: 'Haftalık planın ücretsiz deneme süresi.',
    type: 'number',
    defaultValue: 3,
    min: 0,
    max: 30,
  },
  {
    key: 'paywall.exit_discount',
    label: 'Çıkış indirimi (%)',
    description: 'Paywall kapatılırken gösterilen kuponun indirim oranı.',
    type: 'number',
    defaultValue: 40,
    min: 0,
    max: 90,
  },
  {
    key: 'ads.enabled',
    label: 'Reklamlar açık',
    description: 'Ücretsiz kullanıcılara reklam gösterilsin mi.',
    type: 'boolean',
    defaultValue: false,
  },
  {
    key: 'ads.interstitial_every',
    label: 'Geçiş reklamı sıklığı',
    description: 'Kaç oyun turunda bir geçiş reklamı gösterileceği.',
    type: 'number',
    defaultValue: 4,
    min: 2,
    max: 20,
  },
  {
    key: 'leagues.enabled',
    label: 'Lig sistemi açık',
    description: 'Lig sekmesi ve haftalık sıralama çalışsın mı.',
    type: 'boolean',
    defaultValue: true,
  },
  {
    key: 'announcement.text',
    label: 'Duyuru metni',
    description: 'Ana sayfada gösterilecek duyuru; boşsa duyuru yok.',
    type: 'string',
    defaultValue: '',
  },
  {
    key: 'app.min_version',
    label: 'Zorunlu en düşük sürüm',
    description: 'Bu sürümün altındaki uygulamalar güncelleme ekranı gösterir.',
    type: 'string',
    defaultValue: '0.1.0',
  },
  {
    key: 'experiment.paywall_split',
    label: 'Paywall A/B oranı (%)',
    description: 'Kullanıcıların yüzde kaçının B varyantını göreceği.',
    type: 'number',
    defaultValue: 0,
    min: 0,
    max: 100,
  },
];

export type RemoteConfig = Readonly<Record<string, RemoteValue>>;

export const DEFAULT_REMOTE_CONFIG: RemoteConfig = Object.fromEntries(
  REMOTE_KEYS.map((definition) => [definition.key, definition.defaultValue]),
);

export function findRemoteKey(key: string): RemoteKeyDefinition | undefined {
  return REMOTE_KEYS.find((definition) => definition.key === key);
}

/** Değer anahtarın sözleşmesine uyuyor mu. */
export function isValidRemoteValue(definition: RemoteKeyDefinition, value: unknown): boolean {
  if (definition.type === 'boolean') return typeof value === 'boolean';

  if (definition.type === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) return false;
    if (definition.min !== undefined && value < definition.min) return false;
    if (definition.max !== undefined && value > definition.max) return false;
    return true;
  }

  if (typeof value !== 'string') return false;
  return definition.options === undefined || definition.options.includes(value);
}

/**
 * Sunucudan gelen ham yapılandırmayı güvenli hâle getirir: bilinmeyen
 * anahtarlar atılır, geçersiz değerler varsayılana düşer. Uzaktan
 * yapılan bir hatanın uygulamayı bozmaması bu fonksiyonun işi.
 */
export function mergeRemoteConfig(raw: Readonly<Record<string, unknown>>): RemoteConfig {
  const merged: Record<string, RemoteValue> = { ...DEFAULT_REMOTE_CONFIG };

  for (const definition of REMOTE_KEYS) {
    const value = raw[definition.key];
    if (value === undefined) continue;
    if (!isValidRemoteValue(definition, value)) continue;

    merged[definition.key] = value as RemoteValue;
  }

  return merged;
}

export function remoteString(config: RemoteConfig, key: string): string {
  const value = config[key] ?? findRemoteKey(key)?.defaultValue ?? '';
  return typeof value === 'string' ? value : String(value);
}

export function remoteNumber(config: RemoteConfig, key: string): number {
  const value = config[key] ?? findRemoteKey(key)?.defaultValue ?? 0;
  return typeof value === 'number' ? value : 0;
}

export function remoteBoolean(config: RemoteConfig, key: string): boolean {
  const value = config[key] ?? findRemoteKey(key)?.defaultValue ?? false;
  return typeof value === 'boolean' ? value : false;
}

/**
 * Kullanıcıyı A/B deneyinin hangi kolunda olduğunu belirler.
 *
 * Dağıtım kullanıcı kimliğinden türetiliyor: aynı kullanıcı her
 * açılışta aynı varyantı görüyor ve sunucuya sormaya gerek kalmıyor.
 * Deney adı tohuma giriyor, böylece iki farklı deney aynı kullanıcıyı
 * aynı yöne atmıyor.
 */
export function experimentVariant(
  experiment: string,
  userId: string,
  splitPercent: number,
): 'a' | 'b' {
  if (splitPercent <= 0) return 'a';
  if (splitPercent >= 100) return 'b';

  const bucket = seedFromString(`${experiment}:${userId}`) % 100;
  return bucket < splitPercent ? 'b' : 'a';
}

/** "1.2.3" biçimindeki iki sürümü karşılaştırır. */
export function isVersionBelow(current: string, minimum: string): boolean {
  const parse = (value: string) =>
    value.split('.').map((part) => {
      const parsed = Number.parseInt(part, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    });

  const left = parse(current);
  const right = parse(minimum);
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const a = left[index] ?? 0;
    const b = right[index] ?? 0;
    if (a !== b) return a < b;
  }

  return false;
}
