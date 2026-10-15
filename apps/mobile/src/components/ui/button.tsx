import { minTouchTarget, radius, shadow, spacing } from '@neuropeak/ui';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { tapFeedback, usePressScale } from './press-feedback';
import { Text } from './text';
import { useTheme } from './theme-provider';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Varsayılan: tam genişlik. Birincil eylemler ekran boyunca uzanır. */
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /** Etiketin solunda gösterilecek ikon. */
  icon?: ReactNode;
  accessibilityHint?: string;
};

const SIZES = {
  md: { height: minTouchTarget + 4, paddingHorizontal: spacing.lg },
  lg: { height: 56, paddingHorizontal: spacing.lg },
} as const satisfies Record<ButtonSize, ViewStyle>;

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  fullWidth = true,
  disabled = false,
  loading = false,
  icon,
  accessibilityHint,
}: ButtonProps) {
  const theme = useTheme();
  const inactive = disabled || loading;
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(!inactive);

  const surface: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: theme.colors.brand, ...shadow.card.native },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: theme.colors.danger, ...shadow.card.native },
  };

  const labelColor = {
    primary: 'onBrand',
    secondary: 'textPrimary',
    ghost: 'brand',
    danger: 'onBrand',
  } as const;

  return (
    <Animated.View style={[fullWidth && styles.fullWidth, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: inactive, busy: loading }}
        accessibilityHint={accessibilityHint}
        disabled={inactive}
        onPress={() => {
          tapFeedback();
          onPress();
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.base, SIZES[size], surface[variant], inactive && styles.inactive]}
      >
        {loading ? (
          <ActivityIndicator
            color={
              variant === 'secondary' || variant === 'ghost'
                ? theme.colors.brand
                : theme.colors.onBrand
            }
          />
        ) : (
          <View style={styles.content}>
            {icon}
            <Text variant="bodyStrong" color={labelColor[variant]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  inactive: {
    opacity: 0.45,
  },
});
