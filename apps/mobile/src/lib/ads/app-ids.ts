/**
 * Derlemeye gömülecek AdMob uygulama kimlikleri.
 *
 * `react-native-google-mobile-ads` bağımlılıkta olduğu sürece SDK
 * her derlemeye giriyor; bunu yapılandırmayla kapatmanın yolu yok.
 * SDK de açılışta Info.plist'te bir uygulama kimliği arıyor ve
 * bulamazsa `GADInvalidInitializationException` fırlatıp uygulamayı
 * düşürüyor — arka plan kuyruğunda, yakalanamadan.
 *
 * Bu yüzden kimlik **her zaman** yazılıyor. Gerçek kimlik yoksa
 * Google'ın belgelerinde yayımladığı örnek kimlik kullanılıyor:
 * geçerli bir değer, kimseye ait bir hesabı göstermiyor ve gerçek
 * reklam sunmuyor.
 *
 * Reklamın gösterilip gösterilmeyeceği buraya bakmıyor: `admob.ts`
 * reklam birimi kimlikleri tanımlı değilken hiç reklam istemiyor.
 * Yani örnek kimlikle derlenen uygulama reklamsız çalışıyor, sadece
 * SDK açılışta itiraz etmiyor.
 *
 * https://developers.google.com/admob/ios/quick-start
 */
export const SAMPLE_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511';
export const SAMPLE_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';

export type AdMobAppIds = {
  readonly ios: string;
  readonly android: string;
  /** Gerçek kimliklerle mi derleniyor; mağaza derlemesinde doğru olmalı. */
  readonly isReal: boolean;
};

function clean(value: string | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function adMobAppIds(
  iosAppId: string | undefined,
  androidAppId: string | undefined,
): AdMobAppIds {
  const ios = clean(iosAppId);
  const android = clean(androidAppId);

  // İkisi birden gerekiyor: tek platformun kimliğiyle derlemek,
  // diğer platformu eski hâline — yani çöken hâline — bırakırdı.
  const isReal = ios.length > 0 && android.length > 0;

  return {
    ios: isReal ? ios : SAMPLE_IOS_APP_ID,
    android: isReal ? android : SAMPLE_ANDROID_APP_ID,
    isReal,
  };
}
