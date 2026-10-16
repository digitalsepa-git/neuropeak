import {
  BALL_RADIUS,
  generateTracking,
  stepTracking,
  type Ball,
  type TrackingRound,
} from '@neuropeak/core';
import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';

const BOARD_SIZE = 310;
const FRAME_MS = 1000 / 30;

type Phase = 'preview' | 'moving' | 'picking' | 'result';

/**
 * Tur durumu tek parça tutuluyor: yeni tur gelince toplar, evre ve
 * işaretler birlikte sıfırlanmalı. Ayrı state'ler olsaydı bunları bir
 * efektten senkronlamak gerekirdi; React Compiler da haklı olarak
 * buna itiraz ediyor.
 */
type RoundState = {
  readonly round: TrackingRound;
  readonly balls: readonly Ball[];
  readonly phase: Phase;
  readonly picked: readonly number[];
};

function startRound(level: number, seed: number): RoundState {
  const round = generateTracking(level, seed);
  return { round, balls: round.balls, phase: 'preview', picked: [] };
}

/**
 * Çoklu Takip — seviyeli. Önce hedefler işaretli gösterilir, sonra
 * bütün toplar karışır; durduklarında hedefleri işaretlersin.
 * Hareketin kendisi `stepTracking` ile çekirdekte yürüyor.
 */
export function TrackingGame({ startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();

  const [level, setLevel] = useState(startLevel);
  const [state, setState] = useState<RoundState>(() => startRound(startLevel, startLevel * 7919));
  const [score, setScore] = useState(0);

  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { report } = useRoundFinish(onFinish, onProgress);

  const { round, balls, phase, picked } = state;

  useEffect(() => {
    report({ score, level, completed: level > startLevel });
  }, [level, report, score, startLevel]);

  useEffect(() => {
    return () => {
      if (nextTimer.current !== null) clearTimeout(nextTimer.current);
    };
  }, []);

  // Önizleme → hareket → işaretleme geçişleri.
  useEffect(() => {
    const toMoving = setTimeout(
      () => setState((current) => ({ ...current, phase: 'moving' })),
      round.previewSeconds * 1000,
    );
    const toPicking = setTimeout(
      () => setState((current) => ({ ...current, phase: 'picking' })),
      (round.previewSeconds + round.moveSeconds) * 1000,
    );

    return () => {
      clearTimeout(toMoving);
      clearTimeout(toPicking);
    };
  }, [round]);

  useEffect(() => {
    if (phase !== 'moving') return;

    const handle = setInterval(() => {
      setState((current) => ({ ...current, balls: stepTracking(current.balls, FRAME_MS / 1000) }));
    }, FRAME_MS);

    return () => clearInterval(handle);
  }, [phase]);

  const tapBall = useCallback(
    (id: number) => {
      if (phase !== 'picking' || picked.includes(id)) return;

      tapFeedback();
      const next = [...picked, id];

      if (next.length < round.targetCount) {
        setState((current) => ({ ...current, picked: next }));
        return;
      }

      const targets = new Set(round.balls.filter((ball) => ball.isTarget).map((ball) => ball.id));
      const correct = next.every((item) => targets.has(item));

      setState((current) => ({ ...current, picked: next, phase: 'result' }));
      if (correct) setScore((current) => current + 35 + round.targetCount * 15);

      nextTimer.current = setTimeout(() => {
        const nextLevel = correct ? level + 1 : level;
        setLevel(nextLevel);
        setState(startRound(nextLevel, nextLevel * 7919 + score));
      }, 1000);
    },
    [level, phase, picked, round, score],
  );

  const diameter = BALL_RADIUS * 2 * BOARD_SIZE;

  const hint =
    phase === 'preview'
      ? `${round.targetCount} hedefi aklında tut`
      : phase === 'moving'
        ? 'Gözünle takip et'
        : phase === 'picking'
          ? `${picked.length} / ${round.targetCount} işaretlendi`
          : 'Sıradaki tur geliyor';

  return (
    <View style={styles.root}>
      <Text variant="caption" color="textMuted" style={styles.hint}>
        {hint}
      </Text>

      <View
        style={[
          styles.board,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        {balls.map((ball) => {
          const revealed = phase === 'preview' || phase === 'result';
          const isPicked = picked.includes(ball.id);

          const background =
            revealed && ball.isTarget
              ? palette.accentAttention
              : isPicked
                ? palette.accentAttention
                : theme.colors.surfaceElevated;

          return (
            <Pressable
              key={ball.id}
              accessibilityRole="button"
              accessibilityLabel={`${ball.id + 1}. top`}
              onPress={() => tapBall(ball.id)}
              style={[
                styles.ball,
                {
                  backgroundColor: background,
                  borderColor: theme.colors.border,
                  height: diameter,
                  left: ball.x * BOARD_SIZE - diameter / 2,
                  top: ball.y * BOARD_SIZE - diameter / 2,
                  width: diameter,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ball: {
    borderRadius: radius.pill,
    borderWidth: 2,
    position: 'absolute',
  },
  board: {
    borderRadius: radius.md,
    borderWidth: 2,
    height: BOARD_SIZE,
    overflow: 'hidden',
    width: BOARD_SIZE,
  },
  hint: {
    marginBottom: spacing.md,
  },
  root: {
    alignItems: 'center',
  },
});
