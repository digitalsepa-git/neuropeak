import {
  createRng,
  generateChiralShape,
  mirror,
  rotateTimes,
  seedFromString,
  type Shape,
} from '@neuropeak/core';
import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ShapeGrid } from '@/components/game/shape-grid';
import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { TIMED_ROUND_SECONDS, formatSeconds, useGameTimer } from '@/games/use-game-timer';
import { useRoundFinish } from '@/games/use-round-finish';
import { useT } from '@/lib/i18n';

/** Zorluk, şeklin hücre sayısını belirler: daha çok hücre, daha zor. */
const SHAPE_SIZE: Record<GameProps['difficulty'], number> = {
  easy: 4,
  medium: 5,
  hard: 6,
};

type Trial = {
  readonly reference: Shape;
  readonly candidate: Shape;
  /** Aday yalnızca döndürülmüş mü, yoksa aynalanmış mı. */
  readonly isSame: boolean;
};

function buildTrial(size: number, seed: number): Trial {
  const reference = generateChiralShape(size, seed);
  const rng = createRng(seed + 1);

  const isSame = rng() < 0.5;
  const quarters = Math.floor(rng() * 4);
  const rotated = rotateTimes(reference, quarters);

  return {
    reference,
    candidate: isSame ? rotated : rotateTimes(mirror(reference), quarters),
    isSame,
  };
}

/**
 * Şekil Döndürme — süreli. Soldaki şekil döndürülerek sağdakine
 * oturuyor mu, yoksa aynası mı? Üretilen şekiller her zaman kiral:
 * aksi halde "ayna" seçeneğinin doğru cevabı olmazdı.
 */
export function MentalRotationGame({ difficulty, onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const t = useT();
  const size = SHAPE_SIZE[difficulty];

  const [trial, setTrial] = useState<Trial>(() =>
    buildTrial(SHAPE_SIZE[difficulty], seedFromString('mental-rotation-1')),
  );
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
    (saidSame: boolean) => {
      tapFeedback();
      const correct = saidSame === trial.isSame;

      setScore((current) => (correct ? current + 4 : Math.max(0, current - 2)));
      setAnswered((current) => current + 1);
      setFeedback(correct ? 'correct' : 'wrong');

      trialSeed.current += 1;
      setTrial(buildTrial(size, seedFromString(`mental-rotation-${trialSeed.current}`)));

      if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => setFeedback(null), 220);
    },
    [size, trial.isSame],
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
          <ShapeGrid shape={trial.reference} size={96} color={palette.accentSpatial} />
        </View>
        <Text variant="heading" color="textMuted">
          ?
        </Text>
        <View style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
          <ShapeGrid shape={trial.candidate} size={96} color={palette.accentMemory} />
        </View>
      </View>

      <Text variant="caption" color="textMuted" style={styles.hint}>
        Sağdaki şekil solun döndürülmüş hâli mi?
      </Text>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('play.sameShape')}
          onPress={() => answer(true)}
          style={[styles.action, { backgroundColor: theme.colors.surfaceElevated }]}
        >
          <Text variant="bodyStrong">{t('play.same')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('play.mirrorImage')}
          onPress={() => answer(false)}
          style={[styles.action, { backgroundColor: theme.colors.surfaceElevated }]}
        >
          <Text variant="bodyStrong">{t('play.mirror')}</Text>
        </Pressable>
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
  hint: {
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  panel: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 128,
    justifyContent: 'center',
    width: 128,
  },
  root: {
    alignItems: 'center',
  },
  stage: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
});
