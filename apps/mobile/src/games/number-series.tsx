import { generateNumberSeries } from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';

/**
 * Sayı Dizisi — seviyeli. Diziyi üreten kuralı bulup devamını seçersin.
 * Doğru cevaptan sonra kural kısaca gösterilir; oyun öğretmeli.
 */
export function NumberSeriesGame({ startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();

  const [level, setLevel] = useState(startLevel);
  const [puzzle, setPuzzle] = useState(() => generateNumberSeries(startLevel, startLevel * 7919));
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

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
      const nextStreak = correct ? streak + 1 : 0;
      if (correct) {
        setScore((current) => current + 15 + nextStreak * 5);
      }
      setStreak(nextStreak);

      setTimeout(() => {
        const nextLevel = correct ? level + 1 : level;
        setPicked(null);
        setLevel(nextLevel);
        setPuzzle(generateNumberSeries(nextLevel, nextLevel * 7919 + score));
      }, 900);
    },
    [level, picked, puzzle.correctIndex, score, streak],
  );

  return (
    <View style={styles.root}>
      <View style={styles.sequence}>
        {puzzle.sequence.map((value, index) => (
          <View
            key={`${value}-${index}`}
            style={[styles.term, { backgroundColor: theme.colors.surface }]}
          >
            <Text variant="subheading">{value}</Text>
          </View>
        ))}
        <View style={[styles.term, styles.unknown, { borderColor: theme.colors.brand }]}>
          <Text variant="subheading" color="brand">
            ?
          </Text>
        </View>
      </View>

      <View style={styles.explanationSlot}>
        {picked !== null && picked === puzzle.correctIndex && (
          <Text variant="caption" color="success">
            Kural: {puzzle.ruleName}
          </Text>
        )}
        {picked !== null && picked !== puzzle.correctIndex && (
          <Text variant="caption" color="danger">
            Doğrusu {puzzle.answer} · {puzzle.ruleName}
          </Text>
        )}
      </View>

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
              key={option}
              accessibilityRole="button"
              accessibilityLabel={`${option}`}
              onPress={() => answer(index)}
              style={[
                styles.option,
                { backgroundColor: theme.colors.surfaceElevated, borderColor },
              ]}
            >
              <Text variant="bodyStrong">{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  explanationSlot: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  option: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 2,
    flexBasis: '47%',
    flexGrow: 1,
    paddingVertical: spacing.md,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    width: 300,
  },
  root: {
    alignItems: 'center',
  },
  sequence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    maxWidth: 320,
  },
  term: {
    alignItems: 'center',
    borderRadius: radius.sm,
    justifyContent: 'center',
    minWidth: 56,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  unknown: {
    borderStyle: 'dashed',
    borderWidth: 2,
  },
});
