import { TR_ANAGRAMS } from '@neuropeak/content';
import { generateAnagram, toTurkishUpper } from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';

type Phase = 'typing' | 'correct' | 'wrong';

/**
 * Kelime Avı — seviyeli. İpucunu okuyup karışık harflerden kelimeyi
 * kurarsın. Harfler tahtadan tahmine taşınır; tahmin dolunca kendi
 * kendine kontrol edilir, yanlışsa harfler geri döner.
 */
export function AnagramGame({ startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();

  const [level, setLevel] = useState(startLevel);
  const [puzzle, setPuzzle] = useState(() =>
    generateAnagram(TR_ANAGRAMS, startLevel, startLevel * 7919),
  );
  const [picked, setPicked] = useState<readonly number[]>([]);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');

  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { report } = useRoundFinish(onFinish, onProgress);

  useEffect(() => {
    report({ score, level, completed: level > startLevel });
  }, [level, report, score, startLevel]);

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) clearTimeout(resetTimer.current);
    };
  }, []);

  const guess = picked.map((index) => puzzle.letters[index] ?? '').join('');

  const takeLetter = useCallback(
    (index: number) => {
      if (phase !== 'typing' || picked.includes(index)) return;

      tapFeedback();
      const next = [...picked, index];
      setPicked(next);

      if (next.length < puzzle.letters.length) return;

      const attempt = next.map((item) => puzzle.letters[item] ?? '').join('');
      if (attempt === puzzle.word) {
        setPhase('correct');
        setScore((current) => current + 20 + puzzle.word.length * 5);

        resetTimer.current = setTimeout(() => {
          const nextLevel = level + 1;
          setLevel(nextLevel);
          setPuzzle(generateAnagram(TR_ANAGRAMS, nextLevel, nextLevel * 7919 + score, puzzle.word));
          setPicked([]);
          setPhase('typing');
        }, 900);
        return;
      }

      // Yanlış tahminde seviye düşmez; harfler geri alınır ve oyuncu
      // yeniden dener. Ceza yalnızca puandan.
      setPhase('wrong');
      setScore((current) => Math.max(0, current - 5));
      resetTimer.current = setTimeout(() => {
        setPicked([]);
        setPhase('typing');
      }, 700);
    },
    [level, phase, picked, puzzle.letters, puzzle.word, score],
  );

  const undo = useCallback(() => {
    if (phase !== 'typing' || picked.length === 0) return;
    tapFeedback();
    setPicked((current) => current.slice(0, -1));
  }, [phase, picked.length]);

  const slotColor =
    phase === 'correct'
      ? theme.colors.success
      : phase === 'wrong'
        ? theme.colors.danger
        : theme.colors.border;

  return (
    <View style={styles.root}>
      <View style={[styles.clue, { backgroundColor: theme.colors.surface }]}>
        <Text variant="body" color="textMuted" style={styles.clueText}>
          {puzzle.clue}
        </Text>
      </View>

      <View style={styles.slots}>
        {puzzle.letters.map((_, index) => (
          <View key={index} style={[styles.slot, { borderColor: slotColor }]}>
            <Text variant="subheading">{toTurkishUpper(guess[index] ?? '')}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tiles}>
        {puzzle.letters.map((letter, index) => {
          const used = picked.includes(index);

          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={toTurkishUpper(letter)}
              accessibilityState={{ disabled: used }}
              onPress={() => takeLetter(index)}
              style={[
                styles.tile,
                {
                  backgroundColor: used ? theme.colors.surface : theme.colors.surfaceElevated,
                  opacity: used ? 0.35 : 1,
                },
              ]}
            >
              <Text variant="subheading">{toTurkishUpper(letter)}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Son harfi geri al"
        onPress={undo}
        style={[styles.undo, { borderColor: theme.colors.border }]}
      >
        <Text variant="caption" color="textMuted">
          Geri al
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  clue: {
    borderRadius: radius.md,
    maxWidth: 320,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  clueText: {
    textAlign: 'center',
  },
  root: {
    alignItems: 'center',
  },
  slot: {
    alignItems: 'center',
    borderBottomWidth: 3,
    height: 44,
    justifyContent: 'center',
    width: 34,
  },
  slots: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  tile: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.xl,
    maxWidth: 320,
  },
  undo: {
    borderRadius: radius.pill,
    borderWidth: 1,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
