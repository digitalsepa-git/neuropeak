import { generateQuickDecision } from '@neuropeak/core';
import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { TIMED_ROUND_SECONDS, formatSeconds, useGameTimer } from '@/games/use-game-timer';
import { useRoundFinish } from '@/games/use-round-finish';

const PANEL_SIZE = 140;
const DOT_SIZE = 16;

/** Noktaları paneline sığacak şekilde sarar. */
function Dots({ count, color }: { count: number; color: string }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={[styles.dot, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

/**
 * Hızlı Karar — süreli. İki panel arasında karşılaştırma yaparsın.
 * Soru dönüşümlü olarak "hangisinde daha çok" ve "sayılar aynı mı"
 * diye sorulduğu için kalıba bağlanmak işe yaramıyor.
 */
export function QuickDecisionGame({ difficulty, onFinish, onProgress }: GameProps) {
  const theme = useTheme();

  const [trial, setTrial] = useState(() => generateQuickDecision(difficulty, 1));
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const trialSeed = useRef(1);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { report, finishNow } = useRoundFinish(onFinish, onProgress);
  const remaining = useGameTimer(TIMED_ROUND_SECONDS, finishNow);

  useEffect(() => {
    report({ score, level: answered, completed: answered > 0, label: formatSeconds(remaining) });
  }, [answered, remaining, report, score]);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current);
    };
  }, []);

  const answer = useCallback(
    (index: number) => {
      tapFeedback();
      const correct = index === trial.correctIndex;

      setScore((current) => (correct ? current + 6 : Math.max(0, current - 3)));
      setAnswered((current) => current + 1);
      setFeedback(correct ? 'correct' : 'wrong');

      trialSeed.current += 1;
      setTrial(generateQuickDecision(difficulty, trialSeed.current * 104_729));

      if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => setFeedback(null), 200);
    },
    [difficulty, trial.correctIndex],
  );

  const borderColor =
    feedback === 'correct'
      ? theme.colors.success
      : feedback === 'wrong'
        ? theme.colors.danger
        : 'transparent';

  return (
    <View style={styles.root}>
      <View style={[styles.stage, { borderColor }]}>
        <View style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
          <Dots count={trial.left} color={palette.accentSpeed} />
        </View>
        <View style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
          <Dots count={trial.right} color={palette.accentMemory} />
        </View>
      </View>

      <Text variant="body" color="textMuted" style={styles.prompt}>
        {trial.prompt}
      </Text>

      <View style={styles.actions}>
        {trial.options.map((option, index) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityLabel={option}
            onPress={() => answer(index)}
            style={[styles.action, { backgroundColor: theme.colors.surfaceElevated }]}
          >
            <Text variant="bodyStrong">{option}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    paddingVertical: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    width: 300,
  },
  dot: {
    borderRadius: radius.pill,
    height: DOT_SIZE,
    width: DOT_SIZE,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    maxWidth: PANEL_SIZE - spacing.md * 2,
  },
  panel: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: PANEL_SIZE,
    justifyContent: 'center',
    padding: spacing.sm,
    width: PANEL_SIZE,
  },
  prompt: {
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  root: {
    alignItems: 'center',
  },
  stage: {
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
});
