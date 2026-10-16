import { generateBalance, type BalanceShape } from '@neuropeak/core';
import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';

const GLYPH: Record<BalanceShape, string> = {
  circle: '●',
  triangle: '▲',
  square: '■',
  diamond: '◆',
};

const SHAPE_COLOR: Record<BalanceShape, string> = {
  circle: palette.accentMath,
  triangle: palette.accentSpatial,
  square: palette.accentMemory,
  diamond: palette.accentAttention,
};

function Shapes({ shapes }: { shapes: readonly BalanceShape[] }) {
  return (
    <View style={styles.shapes}>
      {shapes.map((shape, index) => (
        <Text key={index} variant="subheading" style={{ color: SHAPE_COLOR[shape] }}>
          {GLYPH[shape]}
        </Text>
      ))}
    </View>
  );
}

/**
 * Terazi — seviyeli. İpucu terazileri şekillerin kaç daire ettiğini
 * söyler; soru terazisinin boş kefesine kaç daire gerektiğini
 * bulursun. Ağırlıklar önce seçilip eşitlikler onlardan türetildiği
 * için her sorunun tek ve tam sayı cevabı var.
 */
export function BalanceGame({ startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();

  const [level, setLevel] = useState(startLevel);
  const [puzzle, setPuzzle] = useState(() => generateBalance(startLevel, startLevel * 7919));
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { report } = useRoundFinish(onFinish, onProgress);

  useEffect(() => {
    report({ score, level, completed: level > startLevel });
  }, [level, report, score, startLevel]);

  useEffect(() => {
    return () => {
      if (nextTimer.current !== null) clearTimeout(nextTimer.current);
    };
  }, []);

  const answer = useCallback(
    (index: number) => {
      if (picked !== null) return;

      tapFeedback();
      setPicked(index);

      const correct = index === puzzle.correctIndex;
      if (correct) setScore((current) => current + 22);

      nextTimer.current = setTimeout(() => {
        const nextLevel = correct ? level + 1 : level;
        setPicked(null);
        setLevel(nextLevel);
        setPuzzle(generateBalance(nextLevel, nextLevel * 7919 + score));
      }, 900);
    },
    [level, picked, puzzle.correctIndex, score],
  );

  return (
    <View style={styles.root}>
      {puzzle.hints.map((hint) => (
        <View key={hint.shape} style={styles.scale}>
          <View style={[styles.pan, { backgroundColor: theme.colors.surface }]}>
            <Shapes shapes={[hint.shape]} />
          </View>
          <Text variant="subheading" color="textMuted">
            =
          </Text>
          <View style={[styles.pan, { backgroundColor: theme.colors.surface }]}>
            <Shapes shapes={Array.from({ length: hint.circles }, () => 'circle' as const)} />
          </View>
        </View>
      ))}

      <View style={[styles.scale, styles.question]}>
        <View style={[styles.pan, { backgroundColor: theme.colors.surfaceElevated }]}>
          <Shapes shapes={puzzle.question} />
        </View>
        <Text variant="subheading" color="textMuted">
          =
        </Text>
        <View style={[styles.pan, styles.unknown, { borderColor: theme.colors.brand }]}>
          <Text variant="subheading" color="brand">
            ? ●
          </Text>
        </View>
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
              accessibilityLabel={`${option} daire`}
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
    flex: 1,
    paddingVertical: spacing.md,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xl,
    width: 300,
  },
  pan: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  question: {
    marginTop: spacing.lg,
  },
  root: {
    alignItems: 'center',
  },
  scale: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    width: 300,
  },
  shapes: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  unknown: {
    borderStyle: 'dashed',
    borderWidth: 2,
  },
});
