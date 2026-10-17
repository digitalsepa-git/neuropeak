import { radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Icon } from '@/components/icons';
import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';
import { useT } from '@/lib/i18n';

/** Rakamların ekranda kalma süresi; zorluk arttıkça kısalır. */
const DIGIT_MS: Record<GameProps['difficulty'], number> = {
  easy: 900,
  medium: 700,
  hard: 500,
};

const STARTING_LENGTH: Record<GameProps['difficulty'], number> = {
  easy: 3,
  medium: 4,
  hard: 5,
};

/** Bu kadar hatadan sonra oyun biter. */
const LIVES = 2;

type Phase = 'show' | 'input' | 'correct' | 'wrong';

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'submit'] as const;

function randomDigits(length: number): string[] {
  return Array.from({ length }, () => `${Math.floor(Math.random() * 10)}`);
}

/**
 * Sayı Menzili — adaptif. Doğru bilince dizi uzar, yanılınca kısalır ve
 * bir can gider. Skor, ulaşılan en uzun dizidir.
 */
export function DigitSpanGame({ difficulty, onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const t = useT();
  const digitMs = DIGIT_MS[difficulty];

  const [length, setLength] = useState(STARTING_LENGTH[difficulty]);
  const [digits, setDigits] = useState<string[]>([]);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('show');
  const [entry, setEntry] = useState('');
  const [lives, setLives] = useState(LIVES);
  const [bestLength, setBestLength] = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { report, finishNow } = useRoundFinish(onFinish, onProgress);

  useEffect(() => {
    report({
      score: bestLength * 10,
      level: Math.max(1, bestLength),
      completed: bestLength > 0,
    });
  }, [bestLength, report]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
    };
  }, []);

  const startRound = useCallback(
    (roundLength: number) => {
      const next = randomDigits(roundLength);
      setDigits(next);
      setEntry('');
      setVisibleIndex(0);
      setPhase('show');

      next.forEach((_, index) => {
        timers.current.push(setTimeout(() => setVisibleIndex(index + 1), index * digitMs));
      });
      timers.current.push(setTimeout(() => setPhase('input'), next.length * digitMs + 200));
    },
    [digitMs],
  );

  useEffect(() => {
    // Oyun takıldığı anda başlar: ilk diziyi üretip zamanlayıcıları kurar.
    // Kural bunu eşzamanlı setState olarak görüyor; burada kastedilen
    // senkronizasyon değil, dış bir sürecin (zamanlayıcılar) başlatılması.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startRound(STARTING_LENGTH[difficulty]);
  }, [difficulty, startRound]);

  const submit = useCallback(() => {
    const expected = digits.join('');
    const correct = entry === expected;

    if (correct) {
      tapFeedback();
      setPhase('correct');
      setBestLength((current) => Math.max(current, digits.length));
      const nextLength = length + 1;
      setLength(nextLength);
      timers.current.push(setTimeout(() => startRound(nextLength), 700));
      return;
    }

    setPhase('wrong');
    const remaining = lives - 1;
    setLives(remaining);

    if (remaining <= 0) {
      timers.current.push(setTimeout(finishNow, 900));
      return;
    }

    const nextLength = Math.max(3, length - 1);
    setLength(nextLength);
    timers.current.push(setTimeout(() => startRound(nextLength), 900));
  }, [digits, entry, finishNow, length, lives, startRound]);

  const onKey = useCallback(
    (key: (typeof KEYPAD)[number]) => {
      if (phase !== 'input') return;
      tapFeedback();

      if (key === 'clear') {
        setEntry('');
        return;
      }
      if (key === 'submit') {
        if (entry.length > 0) submit();
        return;
      }
      setEntry((current) => (current.length >= 12 ? current : current + key));
    },
    [entry, phase, submit],
  );

  const shownDigit = phase === 'show' ? digits[visibleIndex - 1] : undefined;

  return (
    <View style={styles.root}>
      <View style={styles.lives}>
        {Array.from({ length: LIVES }, (_, index) => (
          <Icon
            key={index}
            name="star"
            size={18}
            filled={index < lives}
            color={index < lives ? theme.colors.warning : theme.colors.border}
          />
        ))}
      </View>

      <View style={[styles.stage, { backgroundColor: theme.colors.surface }]}>
        {phase === 'show' && shownDigit !== undefined && (
          <Animated.View key={visibleIndex} entering={FadeIn.duration(120)}>
            <Text variant="display" style={styles.bigDigit}>
              {shownDigit}
            </Text>
          </Animated.View>
        )}
        {phase === 'input' && (
          <Text variant="display" color={entry.length > 0 ? 'textPrimary' : 'textMuted'}>
            {entry.length > 0 ? entry : '—'}
          </Text>
        )}
        {phase === 'correct' && (
          <Text variant="heading" color="success">
            {t('play.correctShort')}
          </Text>
        )}
        {phase === 'wrong' && (
          <View style={styles.wrong}>
            <Text variant="heading" color="danger">
              {t('play.wrongShort')}
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              Doğrusu {digits.join('')}
            </Text>
          </View>
        )}
      </View>

      <Text variant="caption" color="textMuted" style={styles.lengthLabel}>
        {length} haneli
      </Text>

      <View style={styles.keypad}>
        {KEYPAD.map((key) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={
              key === 'clear' ? t('play.clear') : key === 'submit' ? t('play.confirm') : key
            }
            disabled={phase !== 'input'}
            onPress={() => onKey(key)}
            style={[
              styles.key,
              {
                backgroundColor:
                  key === 'submit' ? theme.colors.brand : theme.colors.surfaceElevated,
                opacity: phase === 'input' ? 1 : 0.4,
              },
            ]}
          >
            <Text variant="bodyStrong" color={key === 'submit' ? 'onBrand' : 'textPrimary'}>
              {key === 'clear' ? '⌫' : key === 'submit' ? '✓' : key}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bigDigit: {
    fontSize: 64,
    lineHeight: 72,
  },
  key: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 56,
    justifyContent: 'center',
    width: 76,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    width: 76 * 3 + spacing.xs * 2,
  },
  lengthLabel: {
    marginBottom: spacing.md,
  },
  lives: {
    flexDirection: 'row',
    gap: spacing.xs2,
    marginBottom: spacing.md,
  },
  root: {
    alignItems: 'center',
  },
  stage: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 120,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 240,
  },
  wrong: {
    alignItems: 'center',
    gap: spacing.xs2,
  },
});
