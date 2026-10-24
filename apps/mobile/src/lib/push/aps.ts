/**
 * Derlemenin bildirim ortamı.
 *
 * Değer derlemeye gömülüyor ve uygulamanın hangi APNs sunucusuna
 * kaydolacağını belirliyor. Yalnızca geliştirme profili sandbox;
 * TestFlight, mağaza ve iç dağıtımla verilen `preview` derlemesi
 * üretim APNs'ini kullanıyor.
 *
 * Kural burada duruyor çünkü yanlış değerin sesi yok: sandbox'a
 * kaydolan bir TestFlight derlemesi jetonu sorunsuz alır, üretimden
 * gönderilen bildirim de hiç ulaşmaz ve hata veren bir yer olmaz.
 */
export type ApsEnvironment = 'development' | 'production';

/**
 * @param buildProfile `EAS_BUILD_PROFILE`; yerel derlemede tanımsız
 *   ve orada doğru yanıt zaten sandbox.
 */
export function apsEnvironmentFor(buildProfile: string | undefined): ApsEnvironment {
  return buildProfile === undefined || buildProfile === 'development'
    ? 'development'
    : 'production';
}
