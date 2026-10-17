import { edgeKey, generateOneLine } from '@neuropeak/core';
import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';
import { useT } from '@/lib/i18n';

const BOARD_SIZE = 300;
const NODE_RADIUS = 11;

/**
 * Tek Çizgi — seviyeli. Kalemi kaldırmadan her kenarı bir kez çiz.
 * Düğümlere sırayla dokunursun; iki düğüm arasında çizilmemiş bir
 * kenar varsa çizgi oraya uzar.
 */
export function OneLineGame({ startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const t = useT();

  const [level, setLevel] = useState(startLevel);
  const [puzzle, setPuzzle] = useState(() => generateOneLine(startLevel, startLevel * 7919));
  const [trail, setTrail] = useState<readonly number[]>([]);
  const [score, setScore] = useState(0);

  const { report } = useRoundFinish(onFinish, onProgress);

  useEffect(() => {
    report({ score, level, completed: level > startLevel });
  }, [level, report, score, startLevel]);

  const drawn = useMemo(() => {
    const keys = new Set<string>();
    for (let step = 1; step < trail.length; step += 1) {
      keys.add(edgeKey(trail[step - 1] as number, trail[step] as number));
    }
    return keys;
  }, [trail]);

  /**
   * Çizim ızgaranın tamamını değil yalnızca kullanılan noktaları
   * kapsar; kullanılmayan satır ve sütunlar şekli tahtanın bir
   * köşesine itmesin diye ölçek ve yerleşim kullanılan kutuya göre
   * hesaplanıyor.
   */
  const layout = useMemo(() => {
    const columns = puzzle.nodes.map((node) => node % puzzle.columns);
    const rows = puzzle.nodes.map((node) => Math.floor(node / puzzle.columns));

    const minColumn = Math.min(...columns);
    const minRow = Math.min(...rows);
    const spanX = Math.max(...columns) - minColumn;
    const spanY = Math.max(...rows) - minRow;

    const usable = BOARD_SIZE - NODE_RADIUS * 4;
    const cell = Math.max(spanX, spanY) === 0 ? usable : usable / Math.max(spanX, spanY);

    return {
      cell,
      minColumn,
      minRow,
      originX: (BOARD_SIZE - cell * spanX) / 2,
      originY: (BOARD_SIZE - cell * spanY) / 2,
    };
  }, [puzzle.columns, puzzle.nodes]);

  const positionOf = useCallback(
    (node: number) => ({
      x: layout.originX + ((node % puzzle.columns) - layout.minColumn) * layout.cell,
      y: layout.originY + (Math.floor(node / puzzle.columns) - layout.minRow) * layout.cell,
    }),
    [layout, puzzle.columns],
  );

  const tapNode = useCallback(
    (node: number) => {
      tapFeedback();

      if (trail.length === 0) {
        setTrail([node]);
        return;
      }

      const current = trail[trail.length - 1] as number;
      if (node === current) return;

      const key = edgeKey(current, node);
      const exists = puzzle.edges.some((edge) => edgeKey(edge.a, edge.b) === key);
      if (!exists || drawn.has(key)) return;

      const next = [...trail, node];
      setTrail(next);

      if (next.length - 1 < puzzle.edges.length) return;

      const nextLevel = level + 1;
      setScore((current2) => current2 + 40 + puzzle.edges.length * 3);
      setLevel(nextLevel);
      setPuzzle(generateOneLine(nextLevel, nextLevel * 7919 + score));
      setTrail([]);
    },
    [drawn, level, puzzle.edges, score, trail],
  );

  const reset = useCallback(() => {
    tapFeedback();
    setTrail([]);
  }, []);

  const head = trail.length > 0 ? (trail[trail.length - 1] as number) : null;

  return (
    <View style={styles.root}>
      <View style={[styles.board, { backgroundColor: theme.colors.surface }]}>
        <Svg width={BOARD_SIZE} height={BOARD_SIZE}>
          {puzzle.edges.map((edge) => {
            const from = positionOf(edge.a);
            const to = positionOf(edge.b);
            const isDrawn = drawn.has(edgeKey(edge.a, edge.b));

            return (
              <Line
                key={edgeKey(edge.a, edge.b)}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isDrawn ? palette.accentLogic : theme.colors.border}
                strokeWidth={isDrawn ? 7 : 4}
                strokeLinecap="round"
              />
            );
          })}

          {puzzle.nodes.map((node) => {
            const position = positionOf(node);

            return (
              <Circle
                key={node}
                cx={position.x}
                cy={position.y}
                r={NODE_RADIUS}
                fill={node === head ? palette.accentLogic : theme.colors.surfaceElevated}
                stroke={theme.colors.border}
                strokeWidth={2}
              />
            );
          })}
        </Svg>

        {/* SVG daireleri dokunmayı iyi yakalamıyor; dokunma alanları
            ayrı ve biraz daha geniş tutuluyor. */}
        {puzzle.nodes.map((node) => {
          const position = positionOf(node);

          return (
            <Pressable
              key={node}
              accessibilityRole="button"
              accessibilityLabel={`${node + 1}. nokta`}
              onPress={() => tapNode(node)}
              style={[
                styles.hit,
                { left: position.x - NODE_RADIUS * 2, top: position.y - NODE_RADIUS * 2 },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text variant="caption" color="textMuted">
          {drawn.size} / {puzzle.edges.length} kenar
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('play.redraw')}
          onPress={reset}
          style={[styles.reset, { borderColor: theme.colors.border }]}
        >
          <Text variant="caption" color="textMuted">
            {t('play.restart')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: radius.lg,
    height: BOARD_SIZE,
    width: BOARD_SIZE,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  hit: {
    height: NODE_RADIUS * 4,
    position: 'absolute',
    width: NODE_RADIUS * 4,
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
});
