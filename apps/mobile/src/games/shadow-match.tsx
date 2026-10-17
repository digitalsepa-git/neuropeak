import {
  createRng,
  growShape,
  rotateTimes,
  sameUpToRotation,
  shapeKey,
  shuffle,
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

const SHAPE_SIZE: Record<GameProps['difficulty'], number> = {
  easy: 4,
  medium: 5,
  hard: 6,
};

type Trial = {
  readonly target: Shape;
  readonly options: readonly Shape[];
  readonly correctIndex: number;
};

/**
 * Hedef şeklin döndürülmüş hâli ile ona benzeyen ama farklı üç şekil.
 * Çeldiriciler hedefle karıştırılmasın diye aynı hücre sayısında ama
 * döndürmeyle hedefe oturmayan şekillerden seçilir.
 */
function buildTrial(size: number, seed: number): Trial {
  const rng = createRng(seed);
  const target = growShape(size, rng);
  const correct = rotateTimes(target, Math.floor(rng() * 4));

  const distractors: Shape[] = [];
  let attempt = 0;

  while (distractors.length < 3 && attempt < 200) {
    attempt += 1;
    const candidate = growShape(size, createRng(seed + attempt * 7919));

    if (sameUpToRotation(candidate, target)) continue;
    if (distractors.some((item) => sameUpToRotation(item, candidate))) continue;

    distractors.push(rotateTimes(candidate, Math.floor(rng() * 4)));
  }

  const options = shuffle([correct, ...distractors], rng);
  const correctKey = shapeKey(correct);

  return {
    target,
    options,
    correctIndex: options.findIndex((option) => shapeKey(option) === correctKey),
  };
}

/**
 * Gölge Eşleştir — süreli. Üstteki şeklin silüetini aşağıdaki dört
 * gölgeden bul. Gölgeler döndürülmüş olabilir.
 */
export function ShadowMatchGame({ difficulty, onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const t = useT();
  const size = SHAPE_SIZE[difficulty];

  const [trial, setTrial] = useState<Trial>(() => buildTrial(SHAPE_SIZE[difficulty], 1));
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const trialSeed = useRef(1);
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
      const correct = index === trial.correctIndex;

      if (correct) {
        setScore((current) => current + 8);
        setSolved((current) => current + 1);
      } else {
        setScore((current) => Math.max(0, current - 3));
      }

      setFeedback(correct ? 'correct' : 'wrong');
      trialSeed.current += 1;
      setTrial(buildTrial(size, trialSeed.current * 104_729));

      if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => setFeedback(null), 220);
    },
    [size, trial.correctIndex],
  );

  const borderColor =
    feedback === 'correct'
      ? theme.colors.success
      : feedback === 'wrong'
        ? theme.colors.danger
        : 'transparent';

  return (
    <View style={styles.root}>
      <View style={[styles.target, { backgroundColor: theme.colors.surface, borderColor }]}>
        <ShapeGrid shape={trial.target} size={90} color={palette.accentSpatial} />
      </View>

      <Text variant="caption" color="textMuted" style={styles.hint}>
        {t('play.findShadow')}
      </Text>

      <View style={styles.options}>
        {trial.options.map((option, index) => (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={`${index + 1}. gölge`}
            onPress={() => answer(index)}
            style={[styles.option, { backgroundColor: theme.colors.surfaceElevated }]}
          >
            <ShapeGrid shape={option} size={66} color={theme.colors.textPrimary} silhouette />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  option: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 92,
    justifyContent: 'center',
    width: 92,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    maxWidth: 200,
  },
  root: {
    alignItems: 'center',
  },
  target: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 124,
    justifyContent: 'center',
    width: 124,
  },
});
