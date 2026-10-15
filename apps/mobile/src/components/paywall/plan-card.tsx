import { radius, spacing } from '@neuropeak/ui';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Badge, Text, tapFeedback, usePressScale, useTheme } from '@/components/ui';
import type { Plan } from '@/lib/billing';

type PlanCardProps = {
  plan: Plan;
  selected: boolean;
  onPress: () => void;
};

export function PlanCard({ plan, selected, onPress }: PlanCardProps) {
  const theme = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${plan.title} ${plan.priceLabel}`}
        onPress={() => {
          tapFeedback();
          onPress();
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: selected ? theme.colors.brand : theme.colors.border,
            borderWidth: selected ? 2 : 1,
          },
        ]}
      >
        <View style={styles.left}>
          <View style={styles.titleRow}>
            <Text variant="subheading" color={selected ? 'brand' : 'textPrimary'}>
              {plan.title}
            </Text>
            {plan.badge !== undefined && <Badge label={plan.badge} tone="brand" />}
          </View>

          {plan.trialDays !== undefined && (
            <Text variant="caption" color="textSecondary">
              {plan.trialDays} gün ücretsiz, sonra {plan.priceLabel}/{plan.periodLabel}
            </Text>
          )}

          {plan.perWeekLabel !== undefined && (
            <Text variant="caption" color="textSecondary">
              {plan.perWeekLabel}
            </Text>
          )}
        </View>

        <View style={styles.right}>
          {plan.strikethroughLabel !== undefined && (
            <Text variant="caption" color="textMuted" style={styles.strikethrough}>
              {plan.strikethroughLabel}
            </Text>
          )}
          <Text variant="bodyStrong" color={selected ? 'brand' : 'textPrimary'}>
            {plan.priceLabel}
          </Text>
          <Text variant="caption" color="textMuted">
            /{plan.periodLabel}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
