import {
  WALL_EAST,
  WALL_NORTH,
  WALL_SOUTH,
  WALL_WEST,
  generateMaze,
  isBlocked,
} from '@neuropeak/core';
import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';
import { useT } from '@/lib/i18n';

const BOARD_SIZE = 300;
const WALL_WIDTH = 2;

type Direction = { readonly label: string; readonly name: string; readonly delta: number };

/**
 * Doğru Yolu Seç — seviyeli. Yön tuşlarıyla labirentten çıkış bulunur.
 * Labirent kusursuz üretildiği için çıkışa giden tek bir yol var;
 * duvara çarpan hamle yok sayılır.
 */
export function MazeGame({ startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const t = useT();

  const [level, setLevel] = useState(startLevel);
  const [maze, setMaze] = useState(() => generateMaze(startLevel, startLevel * 7919));
  const [position, setPosition] = useState(0);
  const [steps, setSteps] = useState(0);
  const [score, setScore] = useState(0);

  const { report } = useRoundFinish(onFinish, onProgress);

  useEffect(() => {
    report({ score, level, completed: level > startLevel });
  }, [level, report, score, startLevel]);

  const cell = BOARD_SIZE / maze.size;

  const move = useCallback(
    (delta: number) => {
      const target = position + delta;
      const row = Math.floor(position / maze.size);
      const targetRow = Math.floor(target / maze.size);

      // Yatay hamlede satır değişmemeli; yoksa kenardan öbür uca geçer.
      if (Math.abs(delta) === 1 && row !== targetRow) return;
      if (target < 0 || target >= maze.size * maze.size) return;
      if (isBlocked(maze.cells, maze.size, position, target)) return;

      tapFeedback();
      setPosition(target);
      setSteps((current) => current + 1);

      if (target !== maze.exit) return;

      const nextLevel = level + 1;
      // En kısa yola yakın bitirmek daha çok puan getirir. `solution`
      // hücreleri sayar, hamle sayısı onun bir eksiğidir.
      const shortest = maze.solution.length - 1;
      const bonus = Math.max(0, 40 - Math.max(0, steps + 1 - shortest) * 2);
      setScore((current) => current + 40 + bonus);
      setLevel(nextLevel);
      setMaze(generateMaze(nextLevel, nextLevel * 7919 + score));
      setPosition(0);
      setSteps(0);
    },
    [level, maze, position, score, steps],
  );

  const directions: readonly Direction[] = [
    { label: '↑', name: t('play.up'), delta: -maze.size },
    { label: '←', name: t('play.left'), delta: -1 },
    { label: '→', name: t('play.right'), delta: 1 },
    { label: '↓', name: t('play.down'), delta: maze.size },
  ];

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.board,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        {maze.cells.map((walls, index) => {
          const row = Math.floor(index / maze.size);
          const column = index % maze.size;

          return (
            <View
              key={index}
              style={[
                styles.cell,
                {
                  borderBottomColor: theme.colors.border,
                  borderBottomWidth: (walls & WALL_SOUTH) === 0 ? 0 : WALL_WIDTH,
                  borderLeftColor: theme.colors.border,
                  borderLeftWidth: (walls & WALL_WEST) === 0 ? 0 : WALL_WIDTH,
                  borderRightColor: theme.colors.border,
                  borderRightWidth: (walls & WALL_EAST) === 0 ? 0 : WALL_WIDTH,
                  borderTopColor: theme.colors.border,
                  borderTopWidth: (walls & WALL_NORTH) === 0 ? 0 : WALL_WIDTH,
                  height: cell,
                  left: column * cell,
                  top: row * cell,
                  width: cell,
                },
              ]}
            />
          );
        })}

        <View
          style={[
            styles.marker,
            {
              backgroundColor: palette.accentMath,
              height: cell * 0.4,
              left: (maze.exit % maze.size) * cell + cell * 0.3,
              top: Math.floor(maze.exit / maze.size) * cell + cell * 0.3,
              width: cell * 0.4,
            },
          ]}
        />

        <View
          style={[
            styles.marker,
            {
              backgroundColor: palette.accentLogic,
              height: cell * 0.55,
              left: (position % maze.size) * cell + cell * 0.225,
              top: Math.floor(position / maze.size) * cell + cell * 0.225,
              width: cell * 0.55,
            },
          ]}
        />
      </View>

      <View style={styles.pad}>
        {directions.map((direction) => (
          <Pressable
            key={direction.name}
            accessibilityRole="button"
            accessibilityLabel={direction.name}
            onPress={() => move(direction.delta)}
            style={[styles.key, { backgroundColor: theme.colors.surfaceElevated }]}
          >
            <Text variant="subheading">{direction.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: radius.md,
    borderWidth: 2,
    height: BOARD_SIZE,
    overflow: 'hidden',
    width: BOARD_SIZE,
  },
  cell: {
    position: 'absolute',
  },
  key: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 60,
    justifyContent: 'center',
    width: 68,
  },
  marker: {
    borderRadius: radius.pill,
    position: 'absolute',
  },
  pad: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  root: {
    alignItems: 'center',
  },
});
