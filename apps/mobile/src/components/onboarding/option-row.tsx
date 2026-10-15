import { radius, spacing } from '@neuropeak/ui';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon } from '@/components/icons';
import { Text, tapFeedback, usePressScale, useTheme } from '@/components/ui';

type OptionRowProps = {
  label: string;
  /** Seçeneği somutlaştıran kısa açıklama. */
  hint?: string;
  selected: boolean;
  onPress: () => void;
  /** Çoklu seçimde kare onay kutusu, tekli seçimde yuvarlak gösterilir. */
  multi?: boolean;
};

export function OptionRow({ label, hint, selected, onPress, multi = false }: OptionRowProps) {
  const theme = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole={multi ? 'checkbox' : 'radio'}
        accessibilityState={{ checked: selected }}
        accessibilityLabel={label}
        onPress={() => {
          tapFeedback();
          onPress();
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.row,
          {
            backgroundColor: theme.colors.surface,
            borderColor: selected ? theme.colors.brand : theme.colors.border,
            borderWidth: selected ? 2 : 1,
          },
        ]}
      >
        <View style={styles.labels}>
          <Text variant="bodyStrong" color={selected ? 'brand' : 'textPrimary'}>
            {label}
          </Text>
          {hint !== undefined && (
            <Text variant="caption" color="textMuted">
              {hint}
            </Text>
          )}
        </View>

        <View
          style={[
            styles.indicator,
            multi ? styles.indicatorSquare : styles.indicatorCircle,
            {
              backgroundColor: selected ? theme.colors.brand : 'transparent',
              borderColor: selected ? theme.colors.brand : theme.colors.border,
            },
          ]}
        >
          {selected && <Icon name="check" color={theme.colors.onBrand} size={14} strokeWidth={3} />}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  indicator: {
    alignItems: 'center',
    borderWidth: 1.5,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  indicatorCircle: {
    borderRadius: radius.pill,
  },
  indicatorSquare: {
    borderRadius: 8,
  },
  labels: {
    flex: 1,
    gap: 2,
  },
  row: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
