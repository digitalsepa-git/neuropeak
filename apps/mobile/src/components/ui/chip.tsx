import { radius, spacing } from '@neuropeak/ui';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { tapFeedback, usePressScale } from './press-feedback';
import { Text } from './text';
import { useTheme } from './theme-provider';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

/** Liste üstü filtre çipi (Tümü · Popüler · IQ Testleri …). */
export function Chip({ label, selected = false, onPress }: ChipProps) {
  const theme = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => {
          tapFeedback();
          onPress();
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.base,
          {
            backgroundColor: selected ? theme.colors.textPrimary : theme.colors.surface,
            borderColor: selected ? theme.colors.textPrimary : theme.colors.border,
          },
        ]}
      >
        <Text variant="caption" color={selected ? 'surface' : 'textSecondary'}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
