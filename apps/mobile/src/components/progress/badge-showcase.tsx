import type { ContentBadge } from '@neuropeak/content';
import { badgeProgress, type BadgeContext, type BadgeTier } from '@neuropeak/core';
import { palette, radius, spacing } from '@neuropeak/ui';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons';
import { Text, useTheme } from '@/components/ui';

/** Bronz, Gümüş, Altın, Platin. */
const TIER_COLORS: Record<BadgeTier, string> = {
  1: '#B87333',
  2: '#9CA3AF',
  3: palette.accentAttention,
  4: palette.accentLogic,
};

/**
 * Büyük hedeflerde "1086 / 10000" rozet altına sığmıyor ve kırpılıyordu.
 * Binin üstündeki hedeflerde yüzde yazılıyor; küçük hedeflerde sayı
 * daha anlamlı olduğu için olduğu gibi kalıyor.
 */
function progressLabel(current: number, target: number): string {
  if (target >= 1000) return `%${Math.floor((current / target) * 100)}`;
  return `${current} / ${target}`;
}

const TIER_LABELS: Record<BadgeTier, string> = {
  1: 'Bronz',
  2: 'Gümüş',
  3: 'Altın',
  4: 'Platin',
};

/**
 * Rozet vitrini. Kilitli rozetlerde koşulun ne kadarının tamamlandığı
 * da yazıyor: "neden kilitli" sorusunun cevabı rozetin kendisinden
 * daha motive edici.
 */
export function BadgeShowcase({
  badges,
  earned,
  context,
}: {
  badges: readonly ContentBadge[];
  earned: readonly string[];
  context: BadgeContext;
}) {
  const theme = useTheme();
  const owned = new Set(earned);

  return (
    <View style={styles.grid}>
      {badges.map((badge) => {
        const isEarned = owned.has(badge.id);
        const progress = badgeProgress(badge.requirement, context);
        const color = TIER_COLORS[badge.tier];

        return (
          <View key={badge.id} style={styles.item}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: isEarned ? `${color}26` : theme.colors.surface,
                  borderColor: isEarned ? color : theme.colors.border,
                },
              ]}
            >
              <Icon
                name={isEarned ? 'shield' : 'lock'}
                color={isEarned ? color : theme.colors.textMuted}
                size={22}
                filled={isEarned}
              />
            </View>

            <Text
              variant="caption"
              color={isEarned ? 'textSecondary' : 'textMuted'}
              align="center"
              numberOfLines={2}
            >
              {badge.title.tr}
            </Text>

            <Text variant="caption" color="textMuted" align="center" numberOfLines={1}>
              {isEarned
                ? TIER_LABELS[badge.tier]
                : progressLabel(progress.current, progress.target)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  item: {
    alignItems: 'center',
    gap: spacing.xs2,
    width: 76,
  },
});
