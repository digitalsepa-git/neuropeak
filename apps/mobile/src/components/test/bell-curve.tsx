import { IQ_MAX, IQ_MIN } from '@neuropeak/core';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { Text, useTheme } from '@/components/ui';

const WIDTH = 300;
const HEIGHT = 110;
const SAMPLES = 80;

/** Normal dağılımın yüksekliği; ortalama 100, standart sapma 15. */
function density(iq: number): number {
  const z = (iq - 100) / 15;
  return Math.exp(-0.5 * z * z);
}

function xFor(iq: number): number {
  return ((iq - IQ_MIN) / (IQ_MAX - IQ_MIN)) * WIDTH;
}

function yFor(iq: number): number {
  return HEIGHT - density(iq) * (HEIGHT - 12);
}

function curvePath(from: number, to: number, close: boolean): string {
  const points: string[] = [];
  for (let index = 0; index <= SAMPLES; index += 1) {
    const iq = from + ((to - from) * index) / SAMPLES;
    points.push(`${index === 0 ? 'M' : 'L'}${xFor(iq).toFixed(2)},${yFor(iq).toFixed(2)}`);
  }

  if (close) {
    points.push(`L${xFor(to).toFixed(2)},${HEIGHT}`);
    points.push(`L${xFor(from).toFixed(2)},${HEIGHT}`);
    points.push('Z');
  }

  return points.join(' ');
}

/**
 * Kullanıcının skorunu nüfus dağılımı üzerinde gösterir: eğrinin altındaki
 * dolu alan, skorun altında kalan kesimdir.
 */
export function BellCurve({ iq }: { iq: number }) {
  const theme = useTheme();
  const clamped = Math.min(Math.max(iq, IQ_MIN), IQ_MAX);

  return (
    <View style={styles.root}>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Path d={curvePath(IQ_MIN, clamped, true)} fill={theme.colors.brand} opacity={0.18} />
        <Path
          d={curvePath(IQ_MIN, IQ_MAX, false)}
          stroke={theme.colors.brand}
          strokeWidth={2}
          fill="none"
        />
        <Line
          x1={xFor(clamped)}
          y1={yFor(clamped)}
          x2={xFor(clamped)}
          y2={HEIGHT}
          stroke={theme.colors.brand}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </Svg>

      <View style={styles.axis}>
        <Text variant="caption" color="textMuted">
          {IQ_MIN}
        </Text>
        <Text variant="caption" color="textMuted">
          100
        </Text>
        <Text variant="caption" color="textMuted">
          {IQ_MAX}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  root: {
    width: '100%',
  },
});
