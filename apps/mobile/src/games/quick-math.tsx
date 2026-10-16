import { generateQuickMath, type QuickMathProblem } from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { TIMED_ROUND_SECONDS, formatSeconds, useGameTimer } from '@/games/use-game-timer';
import { useRoundFinish } from '@/games/use-round-finish';

/**
 * Hızlı İşlem — süreli. Sürede kaç doğru işlem yaptığını ölçer; doğru
 * seri uzadıkça puan artar, yanlış seriyi sıfırlar.
 */
export function QuickMathGame({ difficulty, onFinish, onProgress }: GameProps) {
  const theme = useTheme();

  const [problem, setProblem] = useState<QuickMathProblem>(() => generateQuickMath(difficulty, 1));
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const problemSeed = useRef(1);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { report, finishNow } = useRoundFinish(onFinish, onProgress);
  const remaining = useGameTimer(TIMED_ROUND_SECONDS, finishNow);

  useEffect(() => {
    report({ score, level: solved, completed: solved > 0, label: formatSeconds(remaining) });
  }, [remaining, report, score, solved]);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current);
    };
  }, []);

  const answer = useCallback(
    (index: number) => {
      tapFeedback();
      const correct = index === problem.correctIndex;

      if (correct) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setScore((current) => current + Math.min(5, 1 + Math.floor(nextStreak / 3)));
        setSolved((current) => current + 1);
      } else {
        setStreak(0);
        setScore((current) => Math.max(0, current - 1));
      }

      setFeedback(correct ? 'correct' : 'wrong');
      problemSeed.current += 1;
      setProblem(generateQuickMath(difficulty, problemSeed.current));

      if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => setFeedback(null), 200);
    },
    [difficulty, problem.correctIndex, streak],
  );

  const borderColor =
    feedback === 'correct'
      ? theme.colors.success
      : feedback === 'wrong'
        ? theme.colors.danger
        : 'transparent';

  return (
    <View style={styles.root}>
      <View style={[styles.stage, { backgroundColor: theme.colors.surface, borderColor }]}>
        <Animated.View key={problem.text} entering={FadeIn.duration(100)}>
          <Text variant="display" style={styles.problem}>
            {problem.text}
          </Text>
        </Animated.View>
      </View>

      <Text variant="caption" color="textMuted" style={styles.streak}>
        {streak > 2 ? `${streak} doğru üst üste` : `${solved} işlem`}
      </Text>

      <View style={styles.options}>
        {problem.options.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityLabel={`${option}`}
            onPress={() => answer(problem.options.indexOf(option))}
            style={[styles.option, { backgroundColor: theme.colors.surfaceElevated }]}
          >
            <Text variant="bodyStrong">{option}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    borderRadius: radius.md,
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
  problem: {
    fontSize: 42,
    lineHeight: 52,
  },
  root: {
    alignItems: 'center',
  },
  stage: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 130,
    justifyContent: 'center',
    width: 300,
  },
  streak: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
});
