import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import type { AppLanguage } from '@neuropeak/core';
import { fontFamily } from '@neuropeak/ui';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CelebrationOverlay } from '@/components/celebration-overlay';
import { ThemeProvider, useTheme } from '@/components/ui';
import { AdsProvider } from '@/lib/ads/context';
import { startAnalytics, track } from '@/lib/analytics';
import { ProProvider } from '@/lib/billing/context';
import { I18nProvider, loadLanguage, useT } from '@/lib/i18n';
import { ContentProvider } from '@/lib/content/context';
import { ProgressProvider } from '@/lib/progress/context';
import { loadOnboardingState } from '@/lib/onboarding';
import { OnboardingGateProvider, useOnboardingGate } from '@/lib/onboarding-context';
import { RemoteConfigProvider } from '@/lib/remote/context';
import { useSyncBootstrap } from '@/lib/sync/use-sync';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [language, setLanguage] = useState<AppLanguage | null>(null);

  useEffect(() => {
    void loadOnboardingState().then((state) => {
      setOnboardingCompleted(state.completed);
    });
    void loadLanguage().then(setLanguage);
  }, []);

  const ready = fontsLoaded && onboardingCompleted !== null && language !== null;

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  // Açılış olayı ve düzenli gönderim; Supabase bağlı değilse ikisi de
  // sessizce hiçbir şey yapmıyor.
  useEffect(() => {
    track('app_open');
    return startAnalytics();
  }, []);

  // Fontlar ve onboarding durumu hazır olana kadar açılış ekranı görünür
  // kalır; yanlış ekranın bir an görünmesini engeller.
  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nProvider initialLanguage={language}>
            <RemoteConfigProvider>
              <ContentProvider>
                <ProProvider>
                  <ProgressProvider>
                    <AdsProvider>
                      <OnboardingGateProvider initialCompleted={onboardingCompleted}>
                        <RootStack />
                        <CelebrationOverlay />
                      </OnboardingGateProvider>
                    </AdsProvider>
                  </ProgressProvider>
                </ProProvider>
              </ContentProvider>
            </RemoteConfigProvider>
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootStack() {
  const theme = useTheme();
  const t = useT();
  const { completed } = useOnboardingGate();

  useSyncBootstrap();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: { fontFamily: fontFamily.semibold, fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Protected guard={!completed}>
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      </Stack.Protected>

      <Stack.Protected guard={completed}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="settings"
          options={{ headerShown: true, title: t('settings.title'), presentation: 'modal' }}
        />
        <Stack.Screen
          name="showcase"
          options={{ headerShown: true, title: t('settings.designSystem') }}
        />
        <Stack.Screen name="test/[id]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="brain-age" options={{ gestureEnabled: false }} />
        <Stack.Screen name="profile/[id]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="game/[id]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  );
}
