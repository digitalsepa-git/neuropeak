import type { ConfigContext, ExpoConfig } from 'expo/config';

import { adMobAppIds } from './src/lib/ads/app-ids.ts';
import { apsEnvironmentFor } from './src/lib/push/aps.ts';

/**
 * AdMob uygulama kimliği derlemeye gömülüyor ve eklenti **her zaman**
 * ekleniyor. Önceden kimlik yokken eklenti hiç eklenmiyordu; ama SDK
 * bağımlılıkta olduğu için derlemeye yine giriyor ve Info.plist'te
 * kimlik bulamayınca açılışta uygulamayı düşürüyordu. Gerekçesi ve
 * örnek kimlikler `src/lib/ads/app-ids.ts` içinde.
 */
const appIds = adMobAppIds(
  process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID,
  process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID,
);

/**
 * Bildirim ortamını burada veriyoruz çünkü `expo-notifications`
 * eklentisi entitlement zaten yazılıysa dokunmuyor ve varsayılanı
 * "development". Kuralın kendisi ve gerekçesi `src/lib/push/aps.ts`
 * içinde; orada testleniyor.
 *
 * Atama bilerek en sonda: `eas` komutları çözülmüş yapılandırmayı
 * `app.json`'a geri yazabiliyor ve oraya "development" düşüyor.
 * Buradaki satır onu her derlemede yeniden eziyor, yani app.json'da
 * ne yazdığının önemi yok — ama orada bir `aps-environment`
 * görürsen bu yüzdendir, silinebilir.
 */
const apsEnvironment = apsEnvironmentFor(process.env.EAS_BUILD_PROFILE);

export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins = [...(config.plugins ?? [])];

  plugins.push([
    'react-native-google-mobile-ads',
    {
      iosAppId: appIds.ios,
      androidAppId: appIds.android,
      // iOS'ta izleme izni istenmeden önce kullanıcıya gösterilen metin.
      userTrackingUsageDescription:
        'İzin verirsen reklamlar ilgi alanlarına göre seçilir. Reddetsen de uygulamanın tüm özellikleri açık kalır.',
    },
  ]);

  return {
    ...config,
    name: config.name ?? 'NeuroPeak',
    slug: config.slug ?? 'neuropeak',
    plugins,
    ios: {
      ...config.ios,
      entitlements: {
        ...config.ios?.entitlements,
        'aps-environment': apsEnvironment,
      },
    },
  };
};
