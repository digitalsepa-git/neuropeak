import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { fontFamily } from '@neuropeak/ui';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '@/components/ui';
import { loadOnboardingState } from '@/lib/onboarding';
import { OnboardingGateProvider, useOnboardingGate } from '@/lib/onboarding-context';
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

  useEffect(() => {
    void loadOnboardingState().then((state) => {
      setOnboardingCompleted(state.completed);
    });
  }, []);

  const ready = fontsLoaded && onboardingCompleted !== null;

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  // Fontlar ve onboarding durumu hazır olana kadar açılış ekranı görünür
  // kalır; yanlış ekranın bir an görünmesini engeller.
  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <OnboardingGateProvider initialCompleted={onboardingCompleted}>
            <RootStack />
          </OnboardingGateProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootStack() {
  const theme = useTheme();
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
          options={{ headerShown: true, title: 'Ayarlar', presentation: 'modal' }}
        />
        <Stack.Screen name="showcase" options={{ headerShown: true, title: 'Tasarım Sistemi' }} />
        <Stack.Screen name="test/[id]" options={{ gestureEnabled: false }} />
      </Stack.Protected>
    </Stack>
  );
}
