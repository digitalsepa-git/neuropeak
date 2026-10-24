import { createRng, shuffle } from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { TIMED_ROUND_SECONDS, formatSeconds, useGameTimer } from '@/games/use-game-timer';
import { useRoundFinish } from '@/games/use-round-finish';
import { useT } from '@/lib/i18n';

/** Izgara boyutu zorluğa göre; büyük ızgarada göz daha çok geziyor. */
const GRID_SIZE: Record<GameProps['difficulty'], number> = {
  easy: 4,
  medium: 5,
  hard: 6,
};

const BOARD_SIZE = 310;
const BOARD_PADDING = 2;
const BOARD_BORDER = 2;
/** React Native'de kenarlık ve dolgu genişliğe dahildir. */
const CHROME = (BOARD_PADDING + BOARD_BORDER) * 2;

function buildBoard(size: number, round: number): number[] {
  const rng = createRng(Date.now() + round);
  return shuffle(
    Array.from({ length: size * size }, (_, index) => index + 1),
    rng,
  );
}

/**
 * Simge Avı — süreli. Sayıları 1'den başlayarak sırayla bul. Tablo
 * bitince yenisi gelir; amaç sürede kaç tablo bitirdiğin.
 */
export function SymbolHuntGame({ difficulty, onFinish, onProgress }: GameProps) {
  const t = useT();
  const theme = useTheme();
  const size = GRID_SIZE[difficulty];

  const [round, setRound] = useState(0);
  const [board, setBoard] = useState<number[]>(() => buildBoard(GRID_SIZE[difficulty], 0));
  const [target, setTarget] = useState(1);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(false);

  const { report, finishNow } = useRoundFinish(onFinish, onProgress);
  const remaining = useGameTimer(TIMED_ROUND_SECONDS, finishNow);

  useEffect(() => {
    report({ score, level: round, completed: round > 0, label: formatSeconds(remaining) });
  }, [remaining, report, round, score]);

  const onCellPress = useCallback(
    (value: number) => {
      tapFeedback();

      if (value !== target) {
        setWrong(true);
        setTimeout(() => setWrong(false), 200);
        setScore((current) => Math.max(0, current - 1));
        return;
      }

      setScore((current) => current + 2);

      if (value >= size * size) {
        // Tablo bitti: yenisi gelir ve tamamlama bonusu verilir.
        const nextRound = round + 1;
        setRound(nextRound);
        setScore((current) => current + 20);
        setBoard(buildBoard(size, nextRound));
        setTarget(1);
        return;
      }

      setTarget(value + 1);
    },
    [round, size, target],
  );

  // Kesirli genişlik ızgarayı bir sütun erken sardırıyor; aşağı yuvarlanıp
  // kapsayıcı tam ölçüye göre kuruluyor.
  const cellSize = Math.floor((BOARD_SIZE - (size - 1) * 4) / size);
  const boardWidth = cellSize * size + (size - 1) * 4;

  return (
    <View style={styles.root}>
      <View style={[styles.targetPill, { backgroundColor: theme.colors.brand }]}>
        <Text variant="bodyStrong" color="onBrand">
          {t('play.nextSymbol', { symbol: String(target) })}
        </Text>
      </View>

      <View
        style={[
          styles.board,
          { borderColor: wrong ? theme.colors.danger : 'transparent', width: boardWidth + CHROME },
        ]}
      >
        {board.map((value) => {
          const found = value < target;
          return (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={`${value}`}
              onPress={() => onCellPress(value)}
              style={[
                styles.cell,
                {
                  backgroundColor: found
                    ? theme.colors.surfaceSunken
                    : theme.colors.surfaceElevated,
                  height: cellSize,
                  opacity: found ? 0.4 : 1,
                  width: cellSize,
                },
              ]}
            >
              <Text variant="bodyStrong" color={found ? 'textMuted' : 'textPrimary'}>
                {value}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text variant="caption" color="textMuted" style={styles.hint}>
        {t('play.tablesFinished', { count: round })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: radius.md,
    borderWidth: BOARD_BORDER,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: spacing.md,
    padding: BOARD_PADDING,
  },
  cell: {
    alignItems: 'center',
    borderRadius: radius.sm,
    justifyContent: 'center',
  },
  hint: {
    marginTop: spacing.lg,
  },
  root: {
    alignItems: 'center',
  },
  targetPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
