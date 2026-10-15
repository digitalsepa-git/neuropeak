import { radius, spacing } from '@neuropeak/ui';
import { StyleSheet, View } from 'react-native';

import { Text } from './text';
import { useTheme } from './theme-provider';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'danger' | 'warning';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

/** Küçük durum etiketi: PRO, YENİ, +25 XP, 7 gün seri. */
export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const theme = useTheme();

  const background: Record<BadgeTone, string> = {
    neutral: theme.colors.surfaceSunken,
    brand: theme.colors.brand,
    success: theme.colors.success,
    danger: theme.colors.danger,
    warning: theme.colors.warning,
  };

  return (
    <View style={[styles.base, { backgroundColor: background[tone] }]}>
      <Text variant="overline" color={tone === 'neutral' ? 'textSecondary' : 'onBrand'}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs2,
  },
});
