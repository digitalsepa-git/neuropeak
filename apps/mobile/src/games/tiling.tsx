import { canPlaceTile, generateTiling, rotateTimes, tileCells, type Shape } from '@neuropeak/core';
import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';
import { useT } from '@/lib/i18n';

const BOARD_SIZE = 260;
const TRAY_CELL = 16;

const PIECE_COLORS = [
  palette.accentSpatial,
  palette.accentMemory,
  palette.accentMath,
  palette.accentAttention,
  palette.accentVerbal,
] as const;

function colorOf(id: number): string {
  return PIECE_COLORS[id % PIECE_COLORS.length] as string;
}

/** Tepsideki parçayı küçük ızgara olarak çizer. */
function PieceThumb({ cells, color }: { cells: Shape; color: string }) {
  const width = Math.max(...cells.map((cell) => cell.x)) + 1;
  const height = Math.max(...cells.map((cell) => cell.y)) + 1;

  return (
    <View style={{ height: height * TRAY_CELL, width: width * TRAY_CELL }}>
      {cells.map((cell) => (
        <View
          key={`${cell.x},${cell.y}`}
          style={[
            styles.thumbCell,
            {
              backgroundColor: color,
              height: TRAY_CELL,
              left: cell.x * TRAY_CELL,
              top: cell.y * TRAY_CELL,
              width: TRAY_CELL,
            },
          ]}
        />
      ))}
    </View>
  );
}

type Placed = { readonly pieceId: number; readonly cells: readonly number[] };

/**
 * Parça Birleştir — seviyeli. Parçaları çerçeveye tam oturtursun.
 * Parça seçilip tahtadaki bir hücreye dokunulur; parçanın sol üst
 * hücresi oraya gelir. Parçalar döndürülebilir, "Çıkar" son parçayı
 * geri alır.
 */
export function TilingGame({ startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const t = useT();

  const [level, setLevel] = useState(startLevel);
  const [puzzle, setPuzzle] = useState(() => generateTiling(startLevel, startLevel * 7919));
  const [rotation, setRotation] = useState<Readonly<Record<number, number>>>({});
  const [placed, setPlaced] = useState<readonly Placed[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

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

  const cell = BOARD_SIZE / Math.max(puzzle.rows, puzzle.columns);
  const occupied = useMemo(() => new Set(placed.flatMap((item) => item.cells)), [placed]);

  const cellsOf = useCallback(
    (pieceId: number): Shape => {
      const piece = puzzle.pieces.find((item) => item.id === pieceId);
      if (piece === undefined) return [];
      return rotateTimes(piece.cells, rotation[pieceId] ?? 0);
    },
    [puzzle.pieces, rotation],
  );

  const place = useCallback(
    (index: number) => {
      if (selected === null) return;

      const row = Math.floor(index / puzzle.columns);
      const column = index % puzzle.columns;
      const cells = cellsOf(selected);

      if (!canPlaceTile(puzzle, occupied, cells, row, column)) return;

      tapFeedback();
      const next = [
        ...placed,
        { pieceId: selected, cells: tileCells(puzzle.columns, cells, row, column) },
      ];
      setPlaced(next);
      setSelected(null);

      if (next.length < puzzle.pieces.length) return;

      const nextLevel = level + 1;
      setScore((current) => current + 40 + puzzle.pieces.length * 12);
      nextTimer.current = setTimeout(() => {
        setLevel(nextLevel);
        setPuzzle(generateTiling(nextLevel, nextLevel * 7919 + score));
        setPlaced([]);
        setRotation({});
        setSelected(null);
      }, 800);
    },
    [cellsOf, level, occupied, placed, puzzle, score, selected],
  );

  const rotateSelected = useCallback(() => {
    if (selected === null) return;
    tapFeedback();
    setRotation((current) => ({ ...current, [selected]: (current[selected] ?? 0) + 1 }));
  }, [selected]);

  const undo = useCallback(() => {
    if (placed.length === 0) return;
    tapFeedback();
    setPlaced((current) => current.slice(0, -1));
  }, [placed.length]);

  const tray = puzzle.pieces.filter((piece) => !placed.some((item) => item.pieceId === piece.id));

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.board,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        {Array.from({ length: puzzle.rows * puzzle.columns }, (_, index) => {
          const owner = placed.find((item) => item.cells.includes(index));

          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`${Math.floor(index / puzzle.columns) + 1}. satır ${
                (index % puzzle.columns) + 1
              }. sütun`}
              onPress={() => place(index)}
              style={[
                styles.cell,
                {
                  backgroundColor:
                    owner === undefined ? theme.colors.surfaceElevated : colorOf(owner.pieceId),
                  borderColor: theme.colors.background,
                  height: cell,
                  left: (index % puzzle.columns) * cell,
                  top: Math.floor(index / puzzle.columns) * cell,
                  width: cell,
                },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.tray}>
        {tray.map((piece) => (
          <Pressable
            key={piece.id}
            accessibilityRole="button"
            accessibilityLabel={`${piece.id + 1}. parça`}
            onPress={() => {
              tapFeedback();
              setSelected(piece.id);
            }}
            style={[
              styles.slot,
              {
                backgroundColor: theme.colors.surface,
                borderColor:
                  selected === piece.id ? theme.colors.brand : theme.colors.surfaceElevated,
              },
            ]}
          >
            <PieceThumb cells={cellsOf(piece.id)} color={colorOf(piece.id)} />
          </Pressable>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('play.rotatePiece')}
          onPress={rotateSelected}
          style={[styles.action, { borderColor: theme.colors.border }]}
        >
          <Text variant="caption" color="textMuted">
            Döndür
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('play.undoPiece')}
          onPress={undo}
          style={[styles.action, { borderColor: theme.colors.border }]}
        >
          <Text variant="caption" color="textMuted">
            Çıkar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
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
  root: {
    alignItems: 'center',
  },
  slot: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 2,
    height: 72,
    justifyContent: 'center',
    padding: spacing.xs,
    width: 72,
  },
  thumbCell: {
    borderColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 2,
    borderWidth: 1,
    position: 'absolute',
  },
  tray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.lg,
    maxWidth: 310,
  },
});
