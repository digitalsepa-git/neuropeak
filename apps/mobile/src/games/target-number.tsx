import { generateTargetNumber } from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';

const OPERATORS = ['+', '−', '×', '÷'] as const;
type Operator = (typeof OPERATORS)[number];

function apply(a: number, operator: Operator, b: number): number | null {
  switch (operator) {
    case '+':
      return a + b;
    case '−':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      // Kesirli ara sonuçlar bulmacayı okunmaz yapıyor; yalnızca tam
      // bölünme kabul ediliyor.
      return b !== 0 && a % b === 0 ? a / b : null;
  }
}

/**
 * Hedef Sayı — seviyeli. İki sayı ve bir işlem seçerek onları
 * birleştirirsin; elde tek sayı kalıp hedefe eşit olunca seviye biter.
 * Her bulmacanın çözümü üretim sırasında doğrulanıyor.
 */
export function TargetNumberGame({ startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();

  const [level, setLevel] = useState(startLevel);
  const [puzzle, setPuzzle] = useState(() => generateTargetNumber(startLevel, startLevel * 31_337));
  const [values, setValues] = useState<number[]>(() => [
    ...generateTargetNumber(startLevel, startLevel * 31_337).numbers,
  ]);
  const [firstIndex, setFirstIndex] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [score, setScore] = useState(0);
  const [solvedLevels, setSolvedLevels] = useState(0);

  const { report } = useRoundFinish(onFinish, onProgress);

  useEffect(() => {
    report({ score, level, completed: solvedLevels > 0 });
  }, [level, report, score, solvedLevels]);

  const loadLevel = useCallback((nextLevel: number) => {
    const next = generateTargetNumber(nextLevel, nextLevel * 31_337);
    setPuzzle(next);
    setValues([...next.numbers]);
    setFirstIndex(null);
    setOperator(null);
    setLevel(nextLevel);
  }, []);

  const reset = useCallback(() => {
    tapFeedback();
    setValues([...puzzle.numbers]);
    setFirstIndex(null);
    setOperator(null);
  }, [puzzle.numbers]);

  const onValuePress = useCallback(
    (index: number) => {
      tapFeedback();

      if (firstIndex === null) {
        setFirstIndex(index);
        return;
      }
      if (firstIndex === index) {
        setFirstIndex(null);
        return;
      }
      if (operator === null) {
        setFirstIndex(index);
        return;
      }

      const a = values[firstIndex] as number;
      const b = values[index] as number;
      const result = apply(a, operator, b);

      if (result === null) {
        setFirstIndex(index);
        setOperator(null);
        return;
      }

      const next = values.filter((_, position) => position !== firstIndex && position !== index);
      next.push(result);

      setValues(next);
      setFirstIndex(null);
      setOperator(null);

      if (next.length === 1 && next[0] === puzzle.target) {
        setSolvedLevels((current) => current + 1);
        setScore((current) => current + 60);
        setTimeout(() => loadLevel(level + 1), 600);
      }
    },
    [firstIndex, level, loadLevel, operator, puzzle.target, values],
  );

  const stuck = values.length === 1 && values[0] !== puzzle.target;

  return (
    <View style={styles.root}>
      <View style={[styles.targetCard, { backgroundColor: theme.colors.surface }]}>
        <Text variant="caption" color="textMuted">
          Hedef
        </Text>
        <Text variant="display" color="brand">
          {puzzle.target}
        </Text>
      </View>

      <View style={styles.values}>
        {values.map((value, index) => (
          <Pressable
            key={`${value}-${index}`}
            accessibilityRole="button"
            accessibilityLabel={`${value}`}
            onPress={() => onValuePress(index)}
            style={[
              styles.value,
              {
                backgroundColor:
                  firstIndex === index ? theme.colors.brand : theme.colors.surfaceElevated,
              },
            ]}
          >
            <Text variant="heading" color={firstIndex === index ? 'onBrand' : 'textPrimary'}>
              {value}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.operators}>
        {OPERATORS.map((item) => (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityLabel={item}
            onPress={() => {
              tapFeedback();
              setOperator(item);
            }}
            style={[
              styles.operator,
              {
                backgroundColor:
                  operator === item ? theme.colors.brand : theme.colors.surfaceElevated,
              },
            ]}
          >
            <Text variant="heading" color={operator === item ? 'onBrand' : 'textPrimary'}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable accessibilityRole="button" onPress={reset} style={styles.reset}>
        <Text variant="caption" color={stuck ? 'danger' : 'textMuted'}>
          {stuck ? 'Çıkmaza girdin — baştan başla' : 'Baştan başla'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  operator: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 56,
    justifyContent: 'center',
    width: 64,
  },
  operators: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  reset: {
    marginTop: spacing.xl,
    padding: spacing.xs,
  },
  root: {
    alignItems: 'center',
  },
  targetCard: {
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  value: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  values: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.xl,
    maxWidth: 300,
    minHeight: 68,
  },
});
