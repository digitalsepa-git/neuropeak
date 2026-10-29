import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

/**
 * Ekranın native başlık çubuğunu açar ya da kapatır.
 *
 * Neden kanca, neden JSX değil: `<Stack.Screen>` yalnızca
 * render edildiği sürece ayarı uyguluyor, söküldüğünde eski değere
 * dönmüyor. Testin giriş ekranında başlığı açıp soru ekranına
 * geçtiğimizde başlık ekranda kalıyordu — hem sistemin geri düğmesi
 * hem testin kendi "Çık" düğmesi aynı anda görünüyor, üstelik geri
 * düğmesi testin onaylı çıkış akışını atlıyordu.
 *
 * Kanca her render'da çalıştığı için aşama değiştiğinde başlık da
 * değişiyor; dalların hepsine ayrı ayrı `<Stack.Screen>` koymak
 * gerekmiyor.
 *
 * `useLayoutEffect`: başlık ilk boyama ile aynı karede ayarlanıyor,
 * yoksa ekran bir kare başlıksız (ya da başlıklı) görünüp zıplıyor.
 *
 * Çağrıyı bileşendeki `useCallback`/`useMemo`'lardan **sonra** yaz.
 * Öncesine konduğunda React Compiler mevcut memoizasyonu
 * koruyamıyor ve `preserve-manual-memoization` hatası veriyor.
 */
export function useNativeHeader({ shown, title }: { shown: boolean; title?: string }): void {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: shown, title: title ?? '' });
  }, [navigation, shown, title]);
}
