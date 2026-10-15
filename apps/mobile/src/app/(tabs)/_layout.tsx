import { fontFamily, spacing } from '@neuropeak/ui';
import { Tabs } from 'expo-router';

import { Icon, type IconName } from '@/components/icons';
import { tapFeedback, useTheme } from '@/components/ui';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Ana Sayfa', icon: 'home' },
  { name: 'games', title: 'Oyunlar', icon: 'games' },
  { name: 'tests', title: 'Testler', icon: 'tests' },
  { name: 'progress', title: 'İlerleme', icon: 'progress' },
  { name: 'league', title: 'Lig', icon: 'league' },
];

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: theme.colors.brand,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.medium,
          fontSize: 11,
          letterSpacing: 0,
        },
        tabBarItemStyle: {
          paddingTop: spacing.xs2,
        },
      }}
      screenListeners={{
        tabPress: () => {
          tapFeedback();
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              // react-navigation ColorValue döndürür; SVG'ye yalnızca düz renk dizesi verilir.
              <Icon
                name={tab.icon}
                color={typeof color === 'string' ? color : theme.colors.textMuted}
                size={24}
                strokeWidth={focused ? 2.2 : 1.7}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
