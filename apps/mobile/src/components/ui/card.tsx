import { radius, shadow, spacing } from '@neuropeak/ui';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { tapFeedback, usePressScale } from './press-feedback';
import { useTheme } from './theme-provider';

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  /** Sol kenarda kategori aksan şeridi. */
  accentColor?: string;
  padding?: keyof typeof spacing;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function Card({
  children,
  onPress,
  accentColor,
  padding = 'md',
  style,
  accessibilityLabel,
}: CardProps) {
  const theme = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(onPress !== undefined);

  const surface: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    padding: spacing[padding],
    ...(accentColor !== undefined && {
      borderLeftColor: accentColor,
      borderLeftWidth: 4,
    }),
  };

  if (onPress === undefined) {
    return <View style={[styles.base, surface, style]}>{children}</View>;
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => {
          tapFeedback();
          onPress();
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.base, surface, style]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...shadow.card.native,
  },
});
