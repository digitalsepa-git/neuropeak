import { generateGridRecall } from '@neuropeak/core';
import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';
import { useT } from '@/lib/i18n';

const BOARD_SIZE = 300;
const SHOW_MS = 1600;
const RESULT_MS = 900;

type Phase = 'showing' | 'guessing' | 'result';

/**
 * Bulmaca, evre ve işaretler tek parça: yeni bulmaca gelince üçü
 * birlikte sıfırlanmalı. Ayrı state'ler olsaydı bunları bir efektten
 * senkronlamak gerekirdi.
 */
type RoundState = {
  readonly puzzle: ReturnType<typeof generateGridRecall>;
  readonly phase: Phase;
  readonly picked: readonly number[];
};

function startRound(level: number, seed: number): RoundState {
  return { puzzle: generateGridRecall(level, seed), phase: 'showing', picked: [] };
}

/**
 * Nerede Kaldı? — seviyeli. Izgarada birkaç hücre yanıp söner, sonra
 * kaybolur; aynı hücreleri işaretlersin. Yanlış hücreye dokunmak turu
 * bitirmiyor, seviyeyi tekrarlatıyor.
 */
export function GridRecallGame({ startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const t = useT();

  const [level, setLevel] = useState(startLevel);
  const [state, setState] = useState<RoundState>(() => startRound(startLevel, startLevel * 7919));
  const [score, setScore] = useState(0);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { report } = useRoundFinish(onFinish, onProgress);

  const { puzzle, phase, picked } = state;

  useEffect(() => {
    report({ score, level, completed: level > startLevel });
  }, [level, report, score, startLevel]);

  useEffect(() => {
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, []);

  // Her yeni bulmaca önce gösterilir, sonra tahmine açılır.
  useEffect(() => {
    const handle = setTimeout(
      () => setState((current) => ({ ...current, phase: 'guessing' })),
      SHOW_MS,
    );
    return () => clearTimeout(handle);
  }, [puzzle]);

  const tapCell = useCallback(
    (index: number) => {
      if (phase !== 'guessing' || picked.includes(index)) return;

      tapFeedback();
      const next = [...picked, index];

      // Yanlış hücreye dokunulduğu anda tur biter; doğru hücrelerin
      // hepsi bulununca da.
      const correct = puzzle.cells.includes(index);
      const done = !correct || next.length === puzzle.cells.length;

      if (!done) {
        setState((current) => ({ ...current, picked: next }));
        return;
      }

      setState((current) => ({ ...current, picked: next, phase: 'result' }));
      if (correct) setScore((current) => current + 30 + puzzle.cells.length * 5);

      timer.current = setTimeout(() => {
        const nextLevel = correct ? level + 1 : level;
        setLevel(nextLevel);
        setState(startRound(nextLevel, nextLevel * 7919 + score));
      }, RESULT_MS);
    },
    [level, phase, picked, puzzle.cells, score],
  );

  const cell = BOARD_SIZE / puzzle.size;

  return (
    <View style={styles.root}>
      <Text variant="caption" color="textMuted" style={styles.hint}>
        {phase === 'showing'
          ? t('play.rememberCells')
          : phase === 'guessing'
            ? `${picked.length} / ${puzzle.cells.length} işaretlendi`
            : t('play.nextLevelComing')}
      </Text>

      <View
        style={[
          styles.board,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        {Array.from({ length: puzzle.size * puzzle.size }, (_, index) => {
          const isTarget = puzzle.cells.includes(index);
          const isPicked = picked.includes(index);

          const background =
            phase === 'showing' && isTarget
              ? palette.accentMemory
              : phase === 'result' && isTarget
                ? theme.colors.success
                : isPicked && isTarget
                  ? palette.accentMemory
                  : isPicked
                    ? theme.colors.danger
                    : theme.colors.surfaceElevated;

          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`${Math.floor(index / puzzle.size) + 1}. satır ${
                (index % puzzle.size) + 1
              }. sütun`}
              onPress={() => tapCell(index)}
              style={[
                styles.cell,
                {
                  backgroundColor: background,
                  borderColor: theme.colors.background,
                  height: cell,
                  left: (index % puzzle.size) * cell,
                  top: Math.floor(index / puzzle.size) * cell,
                  width: cell,
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
  board: {
    borderRadius: radius.md,
    borderWidth: 2,
    height: BOARD_SIZE,
    width: BOARD_SIZE,
  },
  cell: {
    borderRadius: radius.sm,
    borderWidth: 2,
    position: 'absolute',
  },
  hint: {
    marginBottom: spacing.md,
  },
  root: {
    alignItems: 'center',
  },
});
