import { BRAIN_AXES, type BrainAxis, type BrainMap } from '@neuropeak/core';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';

import { Text, useTheme } from '@/components/ui';
import { AXIS_LABELS } from '@/data/placeholder';

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 34;
const RINGS = [0.25, 0.5, 0.75, 1];
/** Etiket kutusu; "Problem Çözme" iki satıra sığsın diye geniş. */
const LABEL_WIDTH = 104;

/** Beş eksen; ilki tepede, saat yönünde. */
function angleFor(index: number): number {
  return -Math.PI / 2 + (index * 2 * Math.PI) / BRAIN_AXES.length;
}

function pointFor(index: number, ratio: number): { x: number; y: number } {
  const angle = angleFor(index);
  return {
    x: CENTER + Math.cos(angle) * RADIUS * ratio,
    y: CENTER + Math.sin(angle) * RADIUS * ratio,
  };
}

function polygonFor(ratios: readonly number[]): string {
  return ratios
    .map((ratio, index) => {
      const point = pointFor(index, ratio);
      return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    })
    .join(' ');
}

/**
 * Beyin haritasının radar grafiği. Etiketler SVG'nin dışında, mutlak
 * konumlu metinler olarak duruyor: SVG metni Türkçe karakterlerde
 * yazı tipini tam almıyor, arayüzün geri kalanıyla aynı görünsün.
 */
export function BrainRadar({ map }: { map: BrainMap }) {
  const theme = useTheme();
  const ratios = BRAIN_AXES.map((axis) => Math.max(0.04, map[axis] / 100));

  return (
    <View style={styles.root}>
      <Svg width={SIZE} height={SIZE}>
        {RINGS.map((ring) => (
          <Polygon
            key={ring}
            points={polygonFor(BRAIN_AXES.map(() => ring))}
            fill="none"
            stroke={theme.colors.border}
            strokeWidth={1}
          />
        ))}

        {BRAIN_AXES.map((axis, index) => {
          const end = pointFor(index, 1);
          return (
            <Line
              key={axis}
              x1={CENTER}
              y1={CENTER}
              x2={end.x}
              y2={end.y}
              stroke={theme.colors.border}
              strokeWidth={1}
            />
          );
        })}

        <Polygon
          points={polygonFor(ratios)}
          fill={theme.colors.brand}
          fillOpacity={0.28}
          stroke={theme.colors.brand}
          strokeWidth={2}
        />

        {ratios.map((ratio, index) => {
          const point = pointFor(index, ratio);
          return (
            <Circle
              key={BRAIN_AXES[index]}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={theme.colors.brand}
            />
          );
        })}
      </Svg>

      {BRAIN_AXES.map((axis, index) => {
        const label = pointFor(index, 1.26);
        return (
          <View
            key={axis}
            style={[styles.label, { left: label.x - LABEL_WIDTH / 2, top: label.y - 16 }]}
            pointerEvents="none"
          >
            <Text variant="caption" color="textMuted" align="center" numberOfLines={2}>
              {AXIS_LABELS[axis as BrainAxis]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    width: LABEL_WIDTH,
  },
  root: {
    alignSelf: 'center',
    height: SIZE,
    width: SIZE,
  },
});
