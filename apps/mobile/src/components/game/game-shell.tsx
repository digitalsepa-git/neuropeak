import { radius, spacing } from '@neuropeak/ui';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons';
import { Screen, Text, tapFeedback, useTheme } from '@/components/ui';

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

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Oyundan çık"
          hitSlop={12}
          onPress={() => {
            tapFeedback();
            onExit();
          }}
          style={[styles.exitButton, { backgroundColor: theme.colors.surface }]}
        >
          <Icon name="chevronRight" color={theme.colors.textSecondary} size={18} />
        </Pressable>

        <View style={[styles.statusPill, { backgroundColor: theme.colors.surface }]}>
          <Text variant="caption" color="textSecondary">
            {progressLabel}
          </Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <Text variant="caption">Skor {score}</Text>
        </View>
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
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    transform: [{ rotate: '180deg' }],
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
