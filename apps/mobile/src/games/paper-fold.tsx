import { PAPER_SIZE, generatePaperFold, type HolePattern } from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';

const FOLD_LABEL = {
  vertical: 'dikey',
  horizontal: 'yatay',
} as const;

/** Katlanmış kağıdı ve üzerindeki delikleri çizer. */
function FoldedPaper({
  rows,
  columns,
  punches,
  cellSize,
}: {
  rows: number;
  columns: number;
  punches: readonly { row: number; column: number }[];
  cellSize: number;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.paper,
        {
          backgroundColor: theme.colors.surfaceElevated,
          height: rows * cellSize,
          width: columns * cellSize,
        },
      ]}
    >
      {punches.map((punch) => (
        <View
          key={`${punch.row}-${punch.column}`}
          style={[
            styles.hole,
            {
              backgroundColor: theme.colors.background,
              height: cellSize * 0.5,
              left: punch.column * cellSize + cellSize * 0.25,
              top: punch.row * cellSize + cellSize * 0.25,
              width: cellSize * 0.5,
            },
          ]}
        />
      ))}
    </View>
  );
}

/** Açılmış kağıdı ızgara olarak çizer. */
function UnfoldedPaper({ pattern, cellSize }: { pattern: HolePattern; cellSize: number }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.paper,
        {
          backgroundColor: theme.colors.surfaceElevated,
          height: PAPER_SIZE * cellSize,
          width: PAPER_SIZE * cellSize,
        },
      ]}
    >
      {pattern.map((row, rowIndex) =>
        row.map((hole, columnIndex) =>
          hole ? (
            <View
              key={`${rowIndex}-${columnIndex}`}
              style={[
                styles.hole,
                {
                  backgroundColor: theme.colors.background,
                  height: cellSize * 0.5,
                  left: columnIndex * cellSize + cellSize * 0.25,
                  top: rowIndex * cellSize + cellSize * 0.25,
                  width: cellSize * 0.5,
                },
              ]}
            />
          ) : null,
        ),
      )}
    </View>
  );
}

/**
 * Katla-Aç — seviyeli. Kağıt katlanır, delinir; açılınca deliklerin
 * nerede olacağını bulursun. Doğru cevap yansıtmayla türetiliyor.
 */
export function PaperFoldGame({ startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();

  const [level, setLevel] = useState(startLevel);
  const [puzzle, setPuzzle] = useState(() => generatePaperFold(startLevel, startLevel * 7919));
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

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
      if (correct) setScore((current) => current + 25);

      setTimeout(() => {
        const nextLevel = correct ? level + 1 : level;
        setPicked(null);
        setLevel(nextLevel);
        setPuzzle(generatePaperFold(nextLevel, nextLevel * 7919 + score));
      }, 800);
    },
    [level, picked, puzzle.correctIndex, score],
  );

  const foldText = puzzle.folds.map((fold) => FOLD_LABEL[fold]).join(' ve ');

  return (
    <View style={styles.root}>
      <Text variant="caption" color="textMuted">
        Kağıt {foldText} katlandı ve delindi
      </Text>

      <View style={styles.foldedRow}>
        <FoldedPaper
          rows={puzzle.foldedRows}
          columns={puzzle.foldedColumns}
          punches={puzzle.punches}
          cellSize={30}
        />
      </View>

      <Text variant="caption" color="textMuted" style={styles.question}>
        Açılınca hangisi olur?
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
              accessibilityLabel={`${index + 1}. seçenek`}
              onPress={() => answer(index)}
              style={[styles.option, { borderColor }]}
            >
              <UnfoldedPaper pattern={option} cellSize={26} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  foldedRow: {
    marginTop: spacing.md,
  },
  hole: {
    borderRadius: radius.pill,
    position: 'absolute',
  },
  option: {
    borderRadius: radius.md,
    borderWidth: 2,
    padding: spacing.xs,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    maxWidth: 300,
  },
  paper: {
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  question: {
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  root: {
    alignItems: 'center',
  },
});
