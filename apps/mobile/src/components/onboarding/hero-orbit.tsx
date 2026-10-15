import { palette } from '@neuropeak/ui';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';

const SIZE = 220;
const CENTER = SIZE / 2;
const ORBIT_RADIUS = 72;

/** Uydu düğümleri — üç farklı yetenek alanını temsil eder. */
const NODES = [
  { angle: -90, color: palette.accentMemory },
  { angle: 30, color: palette.accentLogic },
  { angle: 150, color: palette.accentAttention },
];

function polar(angleDeg: number) {
  const radians = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + ORBIT_RADIUS * Math.cos(radians),
    y: CENTER + ORBIT_RADIUS * Math.sin(radians),
  };
}

/**
 * Karşılama ekranının görseli: merkezde marka düğümü, çevresinde yavaşça
 * dönen üç yetenek düğümü. Nefes alan bir ölçek animasyonu eşlik eder.
 */
export function HeroOrbit() {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    rotation.set(
      withRepeat(withTiming(360, { duration: 24000, easing: Easing.linear }), -1, false),
    );
    pulse.set(
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [pulse, rotation]);

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.get()}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.get() }],
  }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.layer, orbitStyle]}>
        <Svg width={SIZE} height={SIZE}>
          {NODES.map((node) => {
            const point = polar(node.angle);
            return (
              <Line
                key={node.angle}
                x1={CENTER}
                y1={CENTER}
                x2={point.x}
                y2={point.y}
                stroke={palette.violet200}
                strokeWidth={2}
              />
            );
          })}
          {NODES.map((node) => {
            const point = polar(node.angle);
            return <Circle key={node.angle} cx={point.x} cy={point.y} r={15} fill={node.color} />;
          })}
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.core, pulseStyle]}>
        <View style={styles.coreInner} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  core: {
    alignItems: 'center',
    backgroundColor: palette.violet500,
    borderRadius: 44,
    height: 88,
    justifyContent: 'center',
    position: 'absolute',
    width: 88,
  },
  coreInner: {
    backgroundColor: palette.violet200,
    borderRadius: 18,
    height: 36,
    opacity: 0.85,
    width: 36,
  },
  layer: {
    height: SIZE,
    position: 'absolute',
    width: SIZE,
  },
  root: {
    alignItems: 'center',
    height: SIZE,
    justifyContent: 'center',
    width: SIZE,
  },
});
