import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useTheme } from '@/components/ui';
import { useT } from '@/lib/i18n';
import type { StringKey } from '@/lib/i18n';
import { useRemoteConfig } from '@/lib/remote/context';

/**
 * Sekme çubuğu.
 *
 * `NativeTabs` gerçek bir `UITabBarController` kuruyor; önceki
 * `Tabs` çubuğu JavaScript'te çizilen bir taklitti. Farkı yalnızca
 * görünüm değil: iOS 26'nın cam efekti, kaydırınca küçülme, uzun
 * basınca çıkan menü, erişilebilirlik davranışları ve sistem
 * ayarlarına uyum işletim sisteminden geliyor. Bunları elde
 * sürdürmek mümkün değildi.
 *
 * Bedeli, çubuğun artık `packages/ui` tasarım sistemine değil iOS'a
 * uyması: renkler ve tipografi sistemden geliyor. Native istemenin
 * doğal sonucu bu.
 *
 * İkonlar SF Symbol: native çubuk kendi SVG'lerimizi kabul
 * etmiyor ve etseydi bile ölçek, kalınlık ve seçili hâl
 * davranışları sistemle tutmazdı.
 */

// `as const`: sembol adları dar literal tip olarak kalıyor ve
// `NativeTabs` onları derleme zamanında SF Symbol kataloğuna karşı
// doğruluyor. Olmayan bir sembol adı yazmak derlemede hata veriyor,
// çalışma anında boş kare olarak değil.
const TABS = [
  { name: 'index', title: 'tab.home', sf: 'house', sfSelected: 'house.fill' },
  {
    name: 'games',
    title: 'tab.games',
    sf: 'gamecontroller',
    sfSelected: 'gamecontroller.fill',
  },
  {
    name: 'tests',
    title: 'tab.tests',
    sf: 'list.clipboard',
    sfSelected: 'list.clipboard.fill',
  },
  {
    name: 'progress',
    title: 'tab.progress',
    sf: 'chart.line.uptrend.xyaxis',
    sfSelected: 'chart.line.uptrend.xyaxis',
  },
  { name: 'league', title: 'tab.league', sf: 'trophy', sfSelected: 'trophy.fill' },
] as const satisfies readonly { name: string; title: StringKey; sf: string; sfSelected: string }[];

export default function TabsLayout() {
  const t = useT();
  const theme = useTheme();
  const { getBoolean } = useRemoteConfig();

  // Lig sekmesi uzaktan kapatılabiliyor: sunucu tarafı sorun çıkarırsa
  // uygulama güncellemesi beklemeden gizlenir.
  const leaguesEnabled = getBoolean('leagues.enabled');

  return (
    // Kaydırınca küçülen çubuk iOS 26'nın kendi davranışı; içeriğe
    // yer açıyor ve yukarı kaydırınca geri geliyor.
    //
    // Tek verdiğimiz görsel ayar seçili sekmenin rengi: çubuğun
    // kendisi, camı, yazı tipi ve ölçüleri sistemden. Marka rengi
    // uygulamanın geri kalanıyla aynı olmasa ekranın ortasındaki mor
    // ile alttaki mavi birbirine yabancı kalırdı.
    <NativeTabs minimizeBehavior="onScrollDown" tintColor={theme.colors.brand}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger
          key={tab.name}
          name={tab.name}
          hidden={tab.name === 'league' && !leaguesEnabled}
        >
          <NativeTabs.Trigger.Label>{t(tab.title)}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: tab.sf, selected: tab.sfSelected }} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
