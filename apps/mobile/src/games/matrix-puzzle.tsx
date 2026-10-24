import { generateMatrixPuzzle, type MatrixCell } from '@neuropeak/core';
import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';
import { useT } from '@/lib/i18n';

const CELL_COLORS = [
  palette.accentMemory,
  palette.accentMath,
  palette.accentAttention,
  palette.accentSpatial,
] as const;

/** Bir hücredeki şekilleri çizer. */
function CellArt({ cell, size }: { cell: MatrixCell; size: number }) {
  const color = CELL_COLORS[cell.colorIndex % CELL_COLORS.length] as string;
  const glyphSize = cell.count > 2 ? size / 3.4 : size / 2.6;
  const radiusValue = glyphSize / 2;

  return (
    <View style={styles.cellArt}>
      {Array.from({ length: cell.count }, (_, index) => (
        <Svg key={index} width={glyphSize} height={glyphSize} viewBox="0 0 24 24">
          {cell.shape === 'circle' && <Circle cx={12} cy={12} r={10} fill={color} />}
          {cell.shape === 'square' && (
            <Rect x={2} y={2} width={20} height={20} rx={3} fill={color} />
          )}
          {cell.shape === 'triangle' && (
            <Polygon
              points="12,2 22,21 2,21"
              fill={color}
              transform={`rotate(${cell.rotation} 12 12)`}
            />
          )}
          {cell.shape === 'diamond' && (
            <Polygon
              points="12,1 23,12 12,23 1,12"
              fill={color}
              transform={`rotate(${cell.rotation} 12 12)`}
            />
          )}
        </Svg>
      ))}
      {radiusValue < 0 && null}
    </View>
  );
}

/**
 * Matris Bulmaca — seviyeli. 3×3 ızgaranın kuralını bulup eksik hücreyi
 * tamamlarsın. Bulmacalar kuraldan üretildiği için doğru cevap kesin.
 */
export function MatrixPuzzleGame({ startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const t = useT();

  const [level, setLevel] = useState(startLevel);
  const [puzzle, setPuzzle] = useState(() =>
    generateMatrixPuzzle(startLevel, startLevel * 104_729),
  );
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const { report } = useRoundFinish(onFinish, onProgress);

  useEffect(() => {
    report({ score, level, completed: level > startLevel });
  }, [level, report, score, startLevel]);

  const answer = useCallback(
    (index: number) => {
      if (picked !== null) return;

      tapFeedback();
      setPicked(index);

      const correct = index === puzzle.correctIndex;
      if (correct) {
        setScore((current) => current + 20 + Math.max(0, 10 - mistakes * 5));
      } else {
        setMistakes((current) => current + 1);
      }

      setTimeout(() => {
        const nextLevel = correct ? level + 1 : level;
        setPicked(null);
        setMistakes(correct ? 0 : mistakes + 1);
        setLevel(nextLevel);
        setPuzzle(generateMatrixPuzzle(nextLevel, nextLevel * 104_729 + mistakes * 31));
      }, 650);
    },
    [level, mistakes, picked, puzzle.correctIndex],
  );

  const cellSize = 74;

  return (
    <View style={styles.root}>
      <View style={styles.grid}>
        {puzzle.cells.map((cell, index) => (
          <View
            key={index}
            style={[
              styles.cell,
              { backgroundColor: theme.colors.surface, height: cellSize, width: cellSize },
            ]}
          >
            <CellArt cell={cell} size={cellSize} />
          </View>
        ))}
        <View
          style={[
            styles.cell,
            styles.missing,
            { borderColor: theme.colors.brand, height: cellSize, width: cellSize },
          ]}
        >
          <Text variant="heading" color="brand">
            ?
          </Text>
        </View>
      </View>

      <Text variant="caption" color="textMuted" style={styles.hint}>
        {t('play.completeMissingCell')}
      </Text>

      <View style={styles.options}>
        {puzzle.options.map((option, index) => {
          const isPicked = picked === index;
          const isCorrect = index === puzzle.correctIndex;
          const borderColor =
            picked === null
              ? theme.colors.border
              : isCorrect
                ? theme.colors.success
                : isPicked
                  ? theme.colors.danger
                  : theme.colors.border;

          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={t('play.optionN', { index: index + 1 })}
              onPress={() => answer(index)}
              style={[
                styles.cell,
                { backgroundColor: theme.colors.surfaceElevated, borderColor, borderWidth: 2 },
                { height: cellSize, width: cellSize },
              ]}
            >
              <CellArt cell={option} size={cellSize} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    borderRadius: radius.sm,
    justifyContent: 'center',
  },
  cellArt: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    width: 74 * 3 + 12,
  },
  hint: {
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  missing: {
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  root: {
    alignItems: 'center',
  },
});
