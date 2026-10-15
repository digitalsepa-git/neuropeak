import { pressedScale, spring } from '@neuropeak/ui';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

/**
 * Basılabilir her öğe aynı şekilde küçülür. Bileşenler kendi animasyonunu
 * yazmaz, bu kancayı kullanır.
 *
 * Paylaşılan değerlere `.get()` / `.set()` ile erişilir; React Compiler açık
 * olduğu için doğrudan `.value` ataması yapılmaz.
 */
export function usePressScale(enabled = true) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return {
    animatedStyle,
    onPressIn: () => {
      if (!enabled) return;
      scale.set(withSpring(pressedScale, spring.snappy));
    },
    onPressOut: () => {
      scale.set(withSpring(1, spring.snappy));
    },
  };
}

/** Dokunma geri bildirimi. Web'de sessizce atlanır. */
export function tapFeedback(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
) {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(style);
}
