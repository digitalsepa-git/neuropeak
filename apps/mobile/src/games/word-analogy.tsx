import { wordBankFor } from '@neuropeak/content';
import { generateWordAnalogy } from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';
import { useI18n, useT } from '@/lib/i18n';

/**
 * Sözel Analoji — seviyeli. "A : B :: C : ?" ilişkisini kurup eksik
 * kelimeyi seçersin. Doğru cevaptan sonra ilişkinin adı gösterilir;
 * Sayı Dizisi'nde olduğu gibi oyun öğretmeli.
 */
export function WordAnalogyGame({ startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const t = useT();
  const { language } = useI18n();
  const bank = wordBankFor(language).analogies;

  const [level, setLevel] = useState(startLevel);
  const [puzzle, setPuzzle] = useState(() =>
    generateWordAnalogy(bank, startLevel, startLevel * 7919),
  );
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

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

  const answer = useCallback(
    (index: number) => {
      if (picked !== null) return;

      tapFeedback();
      setPicked(index);

      const correct = index === puzzle.correctIndex;
      const nextStreak = correct ? streak + 1 : 0;
      if (correct) setScore((current) => current + 18 + nextStreak * 4);
      setStreak(nextStreak);

      nextTimer.current = setTimeout(() => {
        const nextLevel = correct ? level + 1 : level;
        setPicked(null);
        setLevel(nextLevel);
        setPuzzle(generateWordAnalogy(bank, nextLevel, nextLevel * 7919 + score, puzzle.id));
      }, 1100);
    },
    [bank, level, picked, puzzle.correctIndex, puzzle.id, score, streak],
  );

  return (
    <View style={styles.root}>
      <View style={styles.relationRow}>
        <View style={[styles.word, { backgroundColor: theme.colors.surface }]}>
          <Text variant="bodyStrong">{puzzle.left[0]}</Text>
        </View>
        <Text variant="subheading" color="textMuted">
          :
        </Text>
        <View style={[styles.word, { backgroundColor: theme.colors.surface }]}>
          <Text variant="bodyStrong">{puzzle.left[1]}</Text>
        </View>
      </View>

      <Text variant="caption" color="textMuted" style={styles.like}>
        {t('play.analogyLike')}
      </Text>

      <View style={styles.relationRow}>
        <View style={[styles.word, { backgroundColor: theme.colors.surface }]}>
          <Text variant="bodyStrong">{puzzle.right}</Text>
        </View>
        <Text variant="subheading" color="textMuted">
          :
        </Text>
        <View style={[styles.word, styles.unknown, { borderColor: theme.colors.brand }]}>
          <Text variant="bodyStrong" color="brand">
            ?
          </Text>
        </View>
      </View>

      <View style={styles.explanationSlot}>
        {picked !== null && (
          <Text
            variant="caption"
            color={picked === puzzle.correctIndex ? 'success' : 'danger'}
            style={styles.explanationText}
          >
            {t('play.relationLabel', { relation: puzzle.relation })}
          </Text>
        )}
      </View>

      <View style={styles.options}>
        {puzzle.options.map((option, index) => {
          const isPicked = picked === index;
          const isCorrect = index === puzzle.correctIndex;
          const borderColor =
            picked === null
              ? theme.colors.border
              : isCorrect
                ? theme.colors.success
                : isPicked
                  ? theme.colors.danger
                  : theme.colors.border;

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityLabel={option}
              onPress={() => answer(index)}
              style={[
                styles.option,
                { backgroundColor: theme.colors.surfaceElevated, borderColor },
              ]}
            >
              <Text variant="bodyStrong" style={styles.optionText}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  explanationSlot: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    marginVertical: spacing.md,
    maxWidth: 320,
  },
  explanationText: {
    textAlign: 'center',
  },
  like: {
    marginVertical: spacing.sm,
  },
  option: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 2,
    flexBasis: '47%',
    flexGrow: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.md,
  },
  optionText: {
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    width: 300,
  },
  relationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  root: {
    alignItems: 'center',
  },
  unknown: {
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  word: {
    alignItems: 'center',
    borderRadius: radius.sm,
    justifyContent: 'center',
    minWidth: 92,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
