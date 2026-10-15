import { clamp } from '@neuropeak/core';
import { radius, spring } from '@neuropeak/ui';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from './theme-provider';

type ProgressBarProps = {
  /** 0 ile 1 arasında. Aralık dışı değerler sıkıştırılır. */
  value: number;
  height?: number;
  /** Varsayılan marka rengi; kategori ekranlarında aksan rengi verilir. */
  color?: string;
  accessibilityLabel?: string;
};

export function ProgressBar({ value, height = 8, color, accessibilityLabel }: ProgressBarProps) {
  const theme = useTheme();
  const target = clamp(value, 0, 1);
  const progress = useSharedValue(target);

  useEffect(() => {
    progress.set(withSpring(target, spring.gentle));
  }, [progress, target]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.get() * 100}%`,
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(target * 100) }}
      style={[styles.track, { backgroundColor: theme.colors.surfaceSunken, height }]}
    >
      <Animated.View
        style={[styles.fill, { backgroundColor: color ?? theme.colors.brand }, fillStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    borderRadius: radius.pill,
    height: '100%',
  },
  track: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    width: '100%',
  },
});
