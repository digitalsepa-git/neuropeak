import { generateNBack, nBackLevel } from '@neuropeak/core';
import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { TIMED_ROUND_SECONDS, formatSeconds, useGameTimer } from '@/games/use-game-timer';
import { useRoundFinish } from '@/games/use-round-finish';

const SYMBOLS = ['▲', '■', '●', '◆', '★', '✚'] as const;
const SEQUENCE_LENGTH = 200;
const STEP_MS = 2200;

const SYMBOL_COLORS = [
  palette.accentMemory,
  palette.accentMath,
  palette.accentAttention,
  palette.accentSpatial,
  palette.accentVerbal,
  palette.accentLogic,
] as const;

/**
 * N-Geri — süreli. Simgeler tek tek akar; şu anki simge n adım
 * öncekiyle aynıysa "Eşleşme" dersin. Üst üste doğru bildikçe n
 * büyüyor, yani oyun oyuncuya göre zorlaşıyor.
 */
export function NBackGame({ onFinish, onProgress }: GameProps) {
  const theme = useTheme();

  const [n, setN] = useState(1);
  const [sequence, setSequence] = useState(() => generateNBack(SEQUENCE_LENGTH, 1, 1));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answeredAt, setAnsweredAt] = useState(-1);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const seedRef = useRef(1);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { report, finishNow } = useRoundFinish(onFinish, onProgress);
  const remaining = useGameTimer(TIMED_ROUND_SECONDS, finishNow);

  useEffect(() => {
    report({ score, level: n, completed: score > 0, label: formatSeconds(remaining) });
  }, [n, remaining, report, score]);

  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => current + 1), STEP_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current);
    };
  }, []);

  const flash = useCallback((kind: 'correct' | 'wrong') => {
    setFeedback(kind);
    if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 260);
  }, []);

  const answer = useCallback(() => {
    // İlk n simgede karşılaştırılacak bir şey yok.
    if (index < n || answeredAt === index) return;

    tapFeedback();
    setAnsweredAt(index);

    const correct = sequence.symbols[index] === sequence.symbols[index - n];
    const nextStreak = correct ? streak + 1 : 0;

    setScore((current) => (correct ? current + 10 + n * 4 : Math.max(0, current - 5)));
    setStreak(nextStreak);
    flash(correct ? 'correct' : 'wrong');

    const nextN = nBackLevel(nextStreak);
    if (nextN === n) return;

    // n değişince dizi de yenilenmeli: eski dizi eski n için kuruldu.
    seedRef.current += 1;
    setN(nextN);
    setSequence(generateNBack(SEQUENCE_LENGTH, nextN, seedRef.current * 104_729));
    setIndex(0);
    setAnsweredAt(-1);
  }, [answeredAt, flash, index, n, sequence.symbols, streak]);

  const position = index % SEQUENCE_LENGTH;
  const symbol = sequence.symbols[position] ?? 0;

  const borderColor =
    feedback === 'correct'
      ? theme.colors.success
      : feedback === 'wrong'
        ? theme.colors.danger
        : 'transparent';

  return (
    <View style={styles.root}>
      <Text variant="caption" color="textMuted">
        {n} adım geriye bak
      </Text>

      <View
        style={[styles.stage, { backgroundColor: theme.colors.surface, borderColor }]}
        key={index}
      >
        <Text variant="display" style={{ color: SYMBOL_COLORS[symbol] }}>
          {SYMBOLS[symbol]}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Eşleşme"
        onPress={answer}
        style={[styles.action, { backgroundColor: theme.colors.surfaceElevated }]}
      >
        <Text variant="bodyStrong">Eşleşme</Text>
      </Pressable>

      <Text variant="caption" color="textMuted" style={styles.streak}>
        Seri {streak}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    borderRadius: radius.md,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    width: 240,
  },
  root: {
    alignItems: 'center',
  },
  stage: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 200,
    justifyContent: 'center',
    marginTop: spacing.md,
    width: 200,
  },
  streak: {
    marginTop: spacing.md,
  },
});
