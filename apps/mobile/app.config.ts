import type { ConfigContext, ExpoConfig } from 'expo/config';

import { apsEnvironmentFor } from './src/lib/push/aps.ts';

/**
 * AdMob uygulama kimlikleri yerel derlemeye gömülür; env'den okunuyor.
 * Sahte bir kimlik gömmek yanıltıcı olurdu: ikisi de tanımlı değilse
 * eklenti hiç eklenmiyor, uygulama reklamsız derleniyor ve Expo Go'da
 * çalışmaya devam ediyor.
 */
const iosAppId = process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID;
const androidAppId = process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID;

const hasAdMobAppIds =
  typeof iosAppId === 'string' &&
  iosAppId.length > 0 &&
  typeof androidAppId === 'string' &&
  androidAppId.length > 0;

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

  if (hasAdMobAppIds) {
    plugins.push([
      'react-native-google-mobile-ads',
      {
        iosAppId,
        androidAppId,
        // iOS'ta izleme izni istenmeden önce kullanıcıya gösterilen metin.
        userTrackingUsageDescription:
          'İzin verirsen reklamlar ilgi alanlarına göre seçilir. Reddetsen de uygulamanın tüm özellikleri açık kalır.',
      },
    ]);
  }

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
