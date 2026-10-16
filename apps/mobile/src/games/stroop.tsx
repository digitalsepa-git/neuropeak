import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { TIMED_ROUND_SECONDS, formatSeconds, useGameTimer } from '@/games/use-game-timer';
import { useRoundFinish } from '@/games/use-round-finish';

const COLORS = [
  { id: 'red', label: 'KIRMIZI', value: palette.red500 },
  { id: 'blue', label: 'MAVİ', value: palette.accentMemory },
  { id: 'green', label: 'YEŞİL', value: palette.green500 },
  { id: 'yellow', label: 'SARI', value: palette.amber500 },
] as const;

type ColorId = (typeof COLORS)[number]['id'];

type Prompt = {
  /** Yazan kelime. */
  readonly word: string;
  /** Yazının mürekkep rengi — doğru cevap bu. */
  readonly ink: ColorId;
};

/** Zorluk arttıkça kelime ile rengin çakışma olasılığı artar. */
const CONFLICT_RATE: Record<GameProps['difficulty'], number> = {
  easy: 0.5,
  medium: 0.75,
  hard: 0.95,
};

function nextPrompt(conflictRate: number): Prompt {
  const inkIndex = Math.floor(Math.random() * COLORS.length);
  const ink = COLORS[inkIndex] as (typeof COLORS)[number];

  if (Math.random() > conflictRate) {
    return { word: ink.label, ink: ink.id };
  }

  const others = COLORS.filter((color) => color.id !== ink.id);
  const word = others[Math.floor(Math.random() * others.length)] as (typeof COLORS)[number];
  return { word: word.label, ink: ink.id };
}

/**
 * Renk Tuzağı — süreli. Kelimenin ne yazdığı değil, hangi renkte
 * yazıldığı sorulur. Doğru cevap seri uzattıkça daha çok puan getirir.
 */
export function StroopGame({ difficulty, onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const conflictRate = CONFLICT_RATE[difficulty];

  const [prompt, setPrompt] = useState<Prompt>(() => ({ word: 'MAVİ', ink: 'blue' }));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(0);

  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { report, finishNow } = useRoundFinish(onFinish, onProgress);
  const remaining = useGameTimer(TIMED_ROUND_SECONDS, finishNow);

  useEffect(() => {
    report({
      score,
      level: answered,
      completed: answered > 0,
      label: formatSeconds(remaining),
    });
  }, [answered, remaining, report, score]);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current);
    };
  }, []);

  const answer = useCallback(
    (colorId: ColorId) => {
      tapFeedback();
      const correct = colorId === prompt.ink;

      if (correct) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        // Seri uzadıkça puan artar; tavan 5 kat.
        setScore((current) => current + Math.min(5, 1 + Math.floor(nextStreak / 4)));
      } else {
        setStreak(0);
      }

      setAnswered((current) => current + 1);
      setFeedback(correct ? 'correct' : 'wrong');
      setPrompt(nextPrompt(conflictRate));

      if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => setFeedback(null), 220);
    },
    [conflictRate, prompt.ink, streak],
  );

  const feedbackColor =
    feedback === 'correct'
      ? theme.colors.success
      : feedback === 'wrong'
        ? theme.colors.danger
        : 'transparent';

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.stage,
          { backgroundColor: theme.colors.surface, borderColor: feedbackColor },
        ]}
      >
        <Animated.View
          key={`${prompt.word}-${prompt.ink}-${answered}`}
          entering={FadeIn.duration(120)}
        >
          <Text variant="display" style={[styles.word, { color: colorValue(prompt.ink) }]}>
            {prompt.word}
          </Text>
        </Animated.View>
      </View>

      <Text variant="caption" color="textMuted" style={styles.streak}>
        {streak > 2 ? `${streak} doğru üst üste` : 'Yazının rengini seç'}
      </Text>

      <View style={styles.options}>
        {COLORS.map((color) => (
          <Pressable
            key={color.id}
            accessibilityRole="button"
            accessibilityLabel={color.label}
            onPress={() => answer(color.id)}
            style={[styles.option, { backgroundColor: theme.colors.surfaceElevated }]}
          >
            <Text variant="bodyStrong">{color.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function colorValue(id: ColorId): string {
  return (COLORS.find((color) => color.id === id) ?? COLORS[0]).value;
}

const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexBasis: '48%',
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
  stage: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 140,
    justifyContent: 'center',
    width: 300,
  },
  streak: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  word: {
    fontSize: 46,
    lineHeight: 56,
  },
});
