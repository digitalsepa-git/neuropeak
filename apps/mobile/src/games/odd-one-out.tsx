import { clamp } from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { TIMED_ROUND_SECONDS, formatSeconds, useGameTimer } from '@/games/use-game-timer';
import { useRoundFinish } from '@/games/use-round-finish';
import { useT } from '@/lib/i18n';

const BOARD_SIZE = 300;
const BOARD_PADDING = 2;
const BOARD_BORDER = 2;
/** React Native'de kenarlık ve dolgu genişliğe dahildir. */
const CHROME = (BOARD_PADDING + BOARD_BORDER) * 2;

/** Zorluk, renk farkının ne kadar hızlı inceldiğini belirler. */
const FADE_RATE: Record<GameProps['difficulty'], number> = {
  easy: 0.85,
  medium: 0.78,
  hard: 0.7,
};

type Puzzle = {
  readonly columns: number;
  readonly hue: number;
  readonly lightness: number;
  readonly delta: number;
  readonly oddIndex: number;
};

function buildPuzzle(level: number, fadeRate: number): Puzzle {
  // Izgara üçten başlayıp altıya kadar büyür.
  const columns = Math.min(6, 3 + Math.floor(level / 4));
  const hue = Math.floor(Math.random() * 360);

  return {
    columns,
    hue,
    lightness: 55,
    // Fark her turda azalır ama görünür bir tabanın altına inmez.
    delta: Math.max(4, 22 * fadeRate ** level),
    oddIndex: Math.floor(Math.random() * columns * columns),
  };
}

/**
 * Farklı Olanı Bul — süreli. Izgaradaki tek farklı tonu bul; her
 * doğruda ızgara büyür ve fark incelir.
 */
export function OddOneOutGame({ difficulty, onFinish, onProgress }: GameProps) {
  const t = useT();
  const theme = useTheme();
  const fadeRate = FADE_RATE[difficulty];

  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => buildPuzzle(0, FADE_RATE[difficulty]));
  const [wrong, setWrong] = useState(false);

  const { report, finishNow } = useRoundFinish(onFinish, onProgress);
  const remaining = useGameTimer(TIMED_ROUND_SECONDS, finishNow);

  useEffect(() => {
    report({ score, level, completed: level > 0, label: formatSeconds(remaining) });
  }, [level, remaining, report, score]);

  const onTilePress = useCallback(
    (index: number) => {
      tapFeedback();

      if (index !== puzzle.oddIndex) {
        setWrong(true);
        setTimeout(() => setWrong(false), 220);
        setScore((current) => Math.max(0, current - 2));
        return;
      }

      const nextLevel = level + 1;
      setLevel(nextLevel);
      setScore((current) => current + 5 + nextLevel);
      setPuzzle(buildPuzzle(nextLevel, fadeRate));
    },
    [fadeRate, level, puzzle.oddIndex],
  );

  // Kesirli genişlik ızgarayı erken sardırıyor; aşağı yuvarlanıyor.
  const tileSize = Math.floor((BOARD_SIZE - (puzzle.columns - 1) * 6) / puzzle.columns);
  const boardWidth = tileSize * puzzle.columns + (puzzle.columns - 1) * 6;
  const baseColor = `hsl(${puzzle.hue}, 62%, ${puzzle.lightness}%)`;
  const oddColor = `hsl(${puzzle.hue}, 62%, ${clamp(puzzle.lightness + puzzle.delta, 0, 100)}%)`;

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.board,
          { borderColor: wrong ? theme.colors.danger : 'transparent', width: boardWidth + CHROME },
        ]}
      >
        {Array.from({ length: puzzle.columns * puzzle.columns }, (_, index) => (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={t('play.squareN', { index: index + 1 })}
            onPress={() => onTilePress(index)}
            style={{
              backgroundColor: index === puzzle.oddIndex ? oddColor : baseColor,
              borderRadius: radius.sm,
              height: tileSize,
              width: tileSize,
            }}
          />
        ))}
      </View>

      <Text variant="caption" color="textMuted" style={styles.hint}>
        {t('play.roundsAndGrid', { rounds: level, size: puzzle.columns })}
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
    gap: 6,
    padding: BOARD_PADDING,
  },
  hint: {
    marginTop: spacing.lg,
  },
  root: {
    alignItems: 'center',
  },
});
