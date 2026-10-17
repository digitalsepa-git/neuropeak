import { wordBankFor } from '@neuropeak/content';
import { generateWordPair } from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { TIMED_ROUND_SECONDS, formatSeconds, useGameTimer } from '@/games/use-game-timer';
import { useRoundFinish } from '@/games/use-round-finish';
import { useI18n, useT } from '@/lib/i18n';

/**
 * Kelime Bağı — süreli. Verilen kelimenin eş ya da zıt anlamlısını
 * seçersin. Soru her seferinde hangisini istediğini yazıyor; çeldiriciler
 * bilerek öteki ilişkiden seçildiği için soruyu okumadan doğru cevap
 * verilemiyor.
 */
export function WordLinkGame({ onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const t = useT();
  const { language } = useI18n();
  const bank = wordBankFor(language).wordPairs;

  const [puzzle, setPuzzle] = useState(() => generateWordPair(bank, 1));
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const puzzleSeed = useRef(1);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { report, finishNow } = useRoundFinish(onFinish, onProgress);
  const remaining = useGameTimer(TIMED_ROUND_SECONDS, finishNow);

  useEffect(() => {
    report({ score, level: answered, completed: answered > 0, label: formatSeconds(remaining) });
  }, [answered, remaining, report, score]);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current);
    };
  }, []);

  const answer = useCallback(
    (index: number) => {
      tapFeedback();
      const correct = index === puzzle.correctIndex;

      setScore((current) => (correct ? current + 10 : Math.max(0, current - 4)));
      setAnswered((current) => current + 1);
      setFeedback(correct ? 'correct' : 'wrong');

      puzzleSeed.current += 1;
      setPuzzle(generateWordPair(bank, puzzleSeed.current * 104_729, puzzle.id));

      if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => setFeedback(null), 240);
    },
    [bank, puzzle.correctIndex, puzzle.id],
  );

  const borderColor =
    feedback === 'correct'
      ? theme.colors.success
      : feedback === 'wrong'
        ? theme.colors.danger
        : 'transparent';

  return (
    <View style={styles.root}>
      <View style={[styles.prompt, { backgroundColor: theme.colors.surface, borderColor }]}>
        <Text variant="heading">{puzzle.word}</Text>
      </View>

      <Text variant="caption" color="textMuted" style={styles.question}>
        {puzzle.mode === 'synonym' ? t('play.askSynonym') : t('play.askAntonym')}
      </Text>

      <View style={styles.options}>
        {puzzle.options.map((option, index) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityLabel={option}
            onPress={() => answer(index)}
            style={[styles.option, { backgroundColor: theme.colors.surfaceElevated }]}
          >
            <Text variant="bodyStrong" style={styles.optionText}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    borderRadius: radius.md,
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
  prompt: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 2,
    justifyContent: 'center',
    minWidth: 220,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  question: {
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  root: {
    alignItems: 'center',
  },
});
