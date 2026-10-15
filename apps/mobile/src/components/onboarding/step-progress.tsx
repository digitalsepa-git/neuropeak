import { duration, radius, spacing } from '@neuropeak/ui';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/components/ui';

type StepProgressProps = {
  /** Kaçıncı adımdayız (1 tabanlı). */
  current: number;
  total: number;
};

/** Onboarding üstündeki bölmeli ilerleme çizgisi. */
export function StepProgress({ current, total }: StepProgressProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: current }}
      style={styles.row}
    >
      {Array.from({ length: total }, (_, index) => (
        <Segment key={index} filled={index < current} />
      ))}
    </View>
  );
}

function Segment({ filled }: { filled: boolean }) {
  const theme = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(filled ? theme.colors.brand : theme.colors.surfaceSunken, {
      duration: duration.base,
    }),
  }));

  return <Animated.View style={[styles.segment, animatedStyle]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs2 + 2,
  },
  segment: {
    borderRadius: radius.pill,
    flex: 1,
    height: 5,
  },
});
