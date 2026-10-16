import {
  TUBE_CAPACITY,
  canPour,
  generateLiquidSort,
  isSolved,
  pour,
  type Tube,
} from '@neuropeak/core';
import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';

const LIQUID_COLORS = [
  palette.accentMemory,
  palette.accentMath,
  palette.accentAttention,
  palette.accentSpatial,
  palette.accentSpeed,
  palette.accentVerbal,
  palette.violet400,
  palette.grey300,
] as const;

/**
 * Sıvı Sıralama — seviyeli. Her şişede tek renk kalana kadar dökme
 * yaparsın. Tahtalar üretim sırasında çözücüden geçtiği için her
 * seviye çözülebilir.
 */
export function LiquidSortGame({ difficulty, startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();

  const [level, setLevel] = useState(startLevel);
  const [tubes, setTubes] = useState<Tube[]>(
    () => generateLiquidSort(startLevel, startLevel * 7919).tubes as Tube[],
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  const { report } = useRoundFinish(onFinish, onProgress);

  useEffect(() => {
    report({ score, level, completed: level > startLevel });
  }, [level, report, score, startLevel]);

  const onTubePress = useCallback(
    (index: number) => {
      tapFeedback();

      if (selected === null) {
        if ((tubes[index] as Tube).length === 0) return;
        setSelected(index);
        return;
      }

      if (selected === index) {
        setSelected(null);
        return;
      }

      if (!canPour(tubes[selected] as Tube, tubes[index] as Tube)) {
        setSelected(index);
        return;
      }

      const next = pour(tubes, selected, index);
      setTubes(next);
      setSelected(null);
      setMoves((current) => current + 1);

      if (isSolved(next)) {
        const nextLevel = level + 1;
        // Az hamleyle bitirmek daha çok puan getirir.
        setScore((current) => current + 50 + Math.max(0, 40 - moves * 2));
        setLevel(nextLevel);
        setMoves(0);
        setTimeout(() => {
          setTubes(generateLiquidSort(nextLevel, nextLevel * 7919).tubes as Tube[]);
        }, 450);
      }
    },
    [level, moves, selected, tubes],
  );

  const tubeWidth = tubes.length > 7 ? 38 : 46;

  return (
    <View style={styles.root}>
      <View style={styles.tubes}>
        {tubes.map((tube, index) => (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={`${index + 1}. şişe`}
            onPress={() => onTubePress(index)}
            style={[
              styles.tube,
              {
                borderColor: selected === index ? theme.colors.brand : theme.colors.border,
                transform: [{ translateY: selected === index ? -10 : 0 }],
                width: tubeWidth,
              },
            ]}
          >
            {Array.from({ length: TUBE_CAPACITY }, (_, slot) => {
              // Şişe üstten doldurulur: dizinin sonu ağızdır.
              const color = tube[TUBE_CAPACITY - 1 - slot];
              return (
                <View
                  key={slot}
                  style={[
                    styles.liquid,
                    {
                      backgroundColor:
                        color === undefined
                          ? 'transparent'
                          : LIQUID_COLORS[color % LIQUID_COLORS.length],
                    },
                  ]}
                />
              );
            })}
          </Pressable>
        ))}
      </View>

      <Text variant="caption" color="textMuted" style={styles.hint}>
        {moves} hamle · her şişede tek renk kalsın
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    marginTop: spacing.xl,
  },
  liquid: {
    flex: 1,
  },
  root: {
    alignItems: 'center',
  },
  tube: {
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
    borderWidth: 2,
    height: 150,
    overflow: 'hidden',
  },
  tubes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    maxWidth: 330,
  },
});
