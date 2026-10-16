import { generateLogicChain } from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { Icon } from '@/components/icons';
import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';

/**
 * Mantık Zinciri — seviyeli. Verilen karşılaştırmalardan sıralamayı
 * çıkarıp soruyu cevaplarsın. Zincir tam olduğu için cevap her zaman
 * belirli; "bilinemez" diye bir şık yok.
 */
export function LogicChainGame({ startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();

  const [level, setLevel] = useState(startLevel);
  const [puzzle, setPuzzle] = useState(() => generateLogicChain(startLevel, startLevel * 31_337));
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
        setPuzzle(generateLogicChain(nextLevel, nextLevel * 31_337 + score));
      }, 700);
    },
    [level, picked, puzzle.correctIndex, score, streak],
  );

  return (
    <View style={styles.root}>
      <View style={styles.premises}>
        {puzzle.premises.map((premise, index) => (
          <Animated.View
            key={premise}
            entering={FadeInRight.delay(index * 60).duration(200)}
            style={[styles.premise, { backgroundColor: theme.colors.surface }]}
          >
            <Icon name="chevronRight" color={theme.colors.brand} size={16} />
            <Text variant="bodySmall" style={styles.premiseText}>
              {premise}
            </Text>
          </Animated.View>
        ))}
      </View>

      <Text variant="heading" align="center" style={styles.question}>
        {puzzle.question}
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
              key={option}
              accessibilityRole="button"
              accessibilityLabel={option}
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
    justifyContent: 'center',
    width: 300,
  },
  premise: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  premiseText: {
    flex: 1,
  },
  premises: {
    gap: spacing.xs,
    width: 300,
  },
  question: {
    marginBottom: spacing.lg,
    marginTop: spacing.xl,
  },
  root: {
    alignItems: 'center',
  },
});
