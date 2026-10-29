import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from './theme-provider';

/**
 * İçeriğin üstünde yüzen küçük yüzeyler: sayaç çipleri, oyun
 * ekranının kontrol çubuğu.
 *
 * iOS 26'da gerçek `UIGlassEffect`: arkasındaki içeriği kırıp
 * renklendiriyor, cihaz eğildikçe tepki veriyor ve kullanıcı
 * "saydamlığı azalt" dediğinde sistem kendiliğinden opak hâle
 * geçiyor. Bunu taklit etmek mümkün değil.
 *
 * Cam yoksa — iOS 26 öncesi ve Android — düz yüzey rengine
 * düşüyor. Düşmeseydi `GlassView` oralarda saydam bir kutu
 * olurdu ve üstündeki yazı okunmazdı.
 *
 * Bilerek dar tutuldu: Apple camı yüzen denetimler için tarif
 * ediyor, kartlar ve liste satırları için değil. Her yüzeyi cam
 * yapmak hem kılavuza aykırı hem de hiçbir şeyin öne çıkmadığı bir
 * ekran demek.
 */
export function GlassSurface({
  children,
  style,
  interactive = false,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Dokunulabilir bir denetimse: cam basıldıkça tepki veriyor. */
  interactive?: boolean;
}) {
  const theme = useTheme();

  if (!isLiquidGlassAvailable()) {
    return <View style={[style, { backgroundColor: theme.colors.surface }]}>{children}</View>;
  }

  return (
    <GlassView
      style={style}
      glassEffectStyle="regular"
      isInteractive={interactive}
      // Tema uygulamanın kendi açık/koyu ayarını izliyor; sisteminkini
      // değil. Camın da aynı ayarı izlemesi gerekiyor, yoksa koyu
      // oyun ekranında açık cam çıkıyor.
      colorScheme={theme.name === 'dark' ? 'dark' : 'light'}
    >
      {children}
    </GlassView>
  );
}
