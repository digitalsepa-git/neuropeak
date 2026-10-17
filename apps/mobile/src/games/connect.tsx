import { generateConnect, isConnectSolved, neighbourCells } from '@neuropeak/core';
import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';
import { useT } from '@/lib/i18n';

const BOARD_SIZE = 300;

const PAIR_COLORS = [
  palette.accentMemory,
  palette.accentMath,
  palette.accentAttention,
  palette.accentSpatial,
  palette.accentVerbal,
] as const;

function colorOf(index: number): string {
  return PAIR_COLORS[index % PAIR_COLORS.length] as string;
}

function emptyPaths(count: number): number[][] {
  return Array.from({ length: count }, () => []);
}

/**
 * Bağlantı — seviyeli. Aynı renk iki noktayı, yollar birbirini
 * kesmeden bağlarsın. Bir uca dokunup komşu hücrelerle yolu uzatırsın;
 * yolun üstünden geri gitmek son adımı siler.
 */
export function ConnectGame({ startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const t = useT();

  const [level, setLevel] = useState(startLevel);
  const [puzzle, setPuzzle] = useState(() => generateConnect(startLevel, startLevel * 7919));
  const [paths, setPaths] = useState<number[][]>(() => emptyPaths(puzzle.pairs.length));
  const [active, setActive] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const { report } = useRoundFinish(onFinish, onProgress);

  useEffect(() => {
    report({ score, level, completed: level > startLevel });
  }, [level, report, score, startLevel]);

  const cell = BOARD_SIZE / puzzle.size;

  /** Hücre hangi çiftin yolunda ya da ucunda. */
  const ownerOf = useCallback(
    (index: number): number | null => {
      for (const [pairIndex, pair] of puzzle.pairs.entries()) {
        if (pair.a === index || pair.b === index) return pairIndex;
      }
      for (const [pairIndex, path] of paths.entries()) {
        if (path.includes(index)) return pairIndex;
      }
      return null;
    },
    [paths, puzzle.pairs],
  );

  const advance = useCallback(
    (next: number[][]) => {
      if (!isConnectSolved(puzzle, next)) return false;

      const nextLevel = level + 1;
      const nextPuzzle = generateConnect(nextLevel, nextLevel * 7919 + score);

      setScore((current) => current + 45 + puzzle.pairs.length * 10);
      setLevel(nextLevel);
      setPuzzle(nextPuzzle);
      setPaths(emptyPaths(nextPuzzle.pairs.length));
      setActive(null);
      return true;
    },
    [level, puzzle, score],
  );

  const tapCell = useCallback(
    (index: number) => {
      tapFeedback();

      const endpointPair = puzzle.pairs.findIndex((pair) => pair.a === index || pair.b === index);

      // Boştayken yalnızca bir uçtan başlanabilir.
      if (active === null) {
        if (endpointPair === -1) return;
        setActive(endpointPair);
        setPaths((current) =>
          current.map((path, pairIndex) => (pairIndex === endpointPair ? [index] : path)),
        );
        return;
      }

      const path = paths[active] ?? [];
      const head = path[path.length - 1];
      if (head === undefined) return;

      // Son adıma geri dokunmak onu siler.
      if (path.length >= 2 && index === path[path.length - 2]) {
        setPaths((current) =>
          current.map((item, pairIndex) => (pairIndex === active ? path.slice(0, -1) : item)),
        );
        return;
      }

      // Başka bir çiftin ucu: o çifte geçilir.
      if (endpointPair !== -1 && endpointPair !== active) {
        setActive(endpointPair);
        setPaths((current) =>
          current.map((item, pairIndex) => (pairIndex === endpointPair ? [index] : item)),
        );
        return;
      }

      if (!neighbourCells(head, puzzle.size).includes(index)) return;

      const owner = ownerOf(index);
      if (owner !== null && owner !== active) return;
      if (path.includes(index)) return;

      const extended = [...path, index];
      const next = paths.map((item, pairIndex) => (pairIndex === active ? extended : item));
      setPaths(next);

      const pair = puzzle.pairs[active];
      if (pair !== undefined && (index === pair.a || index === pair.b)) {
        setActive(null);
        advance(next);
      }
    },
    [active, advance, ownerOf, paths, puzzle.pairs, puzzle.size],
  );

  const reset = useCallback(() => {
    tapFeedback();
    setPaths(emptyPaths(puzzle.pairs.length));
    setActive(null);
  }, [puzzle.pairs.length]);

  const connected = puzzle.pairs.filter((pair, index) => {
    const path = paths[index] ?? [];
    const first = path[0];
    const last = path[path.length - 1];
    return (
      path.length >= 2 &&
      ((first === pair.a && last === pair.b) || (first === pair.b && last === pair.a))
    );
  }).length;

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.board,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        {Array.from({ length: puzzle.size * puzzle.size }, (_, index) => {
          const row = Math.floor(index / puzzle.size);
          const column = index % puzzle.size;
          const owner = ownerOf(index);
          const isEndpoint = puzzle.pairs.some((pair) => pair.a === index || pair.b === index);
          const onPath = owner !== null && (paths[owner] ?? []).includes(index);

          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`${row + 1}. satır ${column + 1}. sütun`}
              onPress={() => tapCell(index)}
              style={[
                styles.cell,
                {
                  borderColor: theme.colors.background,
                  height: cell,
                  left: column * cell,
                  top: row * cell,
                  width: cell,
                },
              ]}
            >
              {onPath && !isEndpoint && (
                <View
                  style={[
                    styles.trail,
                    { backgroundColor: colorOf(owner), height: cell * 0.4, width: cell * 0.4 },
                  ]}
                />
              )}
              {isEndpoint && (
                <View
                  style={[
                    styles.endpoint,
                    {
                      backgroundColor: colorOf(owner as number),
                      borderColor: active === owner ? theme.colors.textPrimary : 'transparent',
                      height: cell * 0.68,
                      width: cell * 0.68,
                    },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text variant="caption" color="textMuted">
          {connected} / {puzzle.pairs.length} bağlandı
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('play.clearBoard')}
          onPress={reset}
          style={[styles.reset, { borderColor: theme.colors.border }]}
        >
          <Text variant="caption" color="textMuted">
            Temizle
          </Text>
        </Pressable>
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
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    position: 'absolute',
  },
  endpoint: {
    borderRadius: radius.pill,
    borderWidth: 2,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  reset: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  root: {
    alignItems: 'center',
  },
  trail: {
    borderRadius: radius.sm,
  },
});
