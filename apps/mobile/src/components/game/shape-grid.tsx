import { boundsOf, normalize, type Shape } from '@neuropeak/core';
import { radius } from '@neuropeak/ui';
import { StyleSheet, View } from 'react-native';

type ShapeGridProps = {
  shape: Shape;
  /** Kutunun kenar uzunluğu; hücre boyutu şekle göre hesaplanır. */
  size: number;
  color: string;
  /** Silüet modunda şekil tek renk, hücre ayrımı yok. */
  silhouette?: boolean;
};

/** Poliomino şekillerini ızgara üzerinde çizer. */
export function ShapeGrid({ shape, size, color, silhouette = false }: ShapeGridProps) {
  const cells = normalize(shape);
  const { width, height } = boundsOf(cells);
  const cellSize = Math.floor(size / Math.max(width, height));

  return (
    <View style={{ height: cellSize * height, width: cellSize * width }}>
      {cells.map((cell) => (
        <View
          key={`${cell.x},${cell.y}`}
          style={[
            styles.cell,
            {
              backgroundColor: color,
              borderRadius: silhouette ? 0 : 3,
              height: cellSize,
              left: cell.x * cellSize,
              top: cell.y * cellSize,
              width: cellSize,
            },
            !silhouette && styles.separated,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    position: 'absolute',
  },
  separated: {
    borderColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: radius.sm / 3,
    borderWidth: 1,
  },
});
