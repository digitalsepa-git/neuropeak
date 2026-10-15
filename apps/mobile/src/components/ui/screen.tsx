import { screenPadding } from '@neuropeak/ui';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from './theme-provider';

type ScreenProps = {
  children: ReactNode;
  /** İçerik ekrandan taşabiliyorsa. */
  scroll?: boolean;
  /** Kenar boşluğu. Kenardan kenara listelerde kapatılır. */
  padded?: boolean;
  edges?: readonly Edge[];
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'left', 'right'],
}: ScreenProps) {
  const theme = useTheme();
  const contentStyle = padded ? styles.padded : undefined;

  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={[contentStyle, styles.scrollContent]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: screenPadding,
  },
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: screenPadding * 2,
  },
});
