import { radius, spacing } from '@neuropeak/ui';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { GlassSurface, Screen, Text, tapFeedback, useTheme } from '@/components/ui';
import { useT } from '@/lib/i18n';

type GameShellProps = {
  /** Üst barın solunda görünen ilerleme bilgisi: "Seviye 3" ya da "0:42". */
  progressLabel: string;
  score: number;
  instruction: string;
  onExit: () => void;
  children: ReactNode;
  /** Oyun alanının altındaki araç çubuğu (ipucu, geri al…). */
  toolbar?: ReactNode;
};

/**
 * Bütün oyunların ortak çerçevesi: koyu tema, üst bar, yönerge balonu ve
 * oyun alanı. Oyunlar yalnızca kendi alanlarını çizer.
 */
export function GameShell({
  progressLabel,
  score,
  instruction,
  onExit,
  children,
  toolbar,
}: GameShellProps) {
  const theme = useTheme();
  const t = useT();

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('game.exit')}
          hitSlop={12}
          onPress={() => {
            tapFeedback();
            onExit();
          }}
          style={styles.exitButton}
        >
          {/* Oyun alanının üstünde yüzen iki denetim: çıkış ve
              durum. Camın altından oyun görünüyor, denetimler yine
              de okunuyor. */}
          <GlassSurface style={styles.exitSurface} interactive>
            <SymbolView name="xmark" size={15} tintColor={theme.colors.textSecondary} />
          </GlassSurface>
        </Pressable>

        <GlassSurface style={styles.statusPill}>
          <Text variant="caption" color="textSecondary">
            {progressLabel}
          </Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <Text variant="caption">
            {t('game.score')} {score}
          </Text>
        </GlassSurface>
      </View>

      <View style={[styles.instruction, { backgroundColor: theme.colors.surfaceElevated }]}>
        <Text variant="bodySmall" color="textSecondary" align="center">
          {instruction}
        </Text>
      </View>

      <View style={styles.board}>{children}</View>

      {toolbar !== undefined && <View style={styles.toolbar}>{toolbar}</View>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  board: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  divider: {
    height: 14,
    width: 1,
  },
  exitButton: {
    height: 36,
    width: 36,
  },
  exitSurface: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 36,
  },
  instruction: {
    alignSelf: 'center',
    borderRadius: radius.pill,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusPill: {
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingBottom: spacing.md,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
});
