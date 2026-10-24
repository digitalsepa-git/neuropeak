import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';
import { useT } from '@/lib/i18n';

/** Bir turda kaç ölçüm alınır. */
const TRIALS = 5;

/** Yeşile dönmeden önceki bekleme aralığı; tahmin edilemesin diye geniş. */
const WAIT_MIN_MS = 1200;
const WAIT_MAX_MS = 4000;

/** Bu sürenin altındaki tepki, yeşili görmeden basılmış demektir. */
const HUMAN_FLOOR_MS = 120;

type Phase = 'idle' | 'waiting' | 'ready' | 'early' | 'done';

/**
 * Reaksiyon — süreli değil, ölçümlü. Ekran yeşile dönünce bas; beş
 * ölçümün ortalaması skoru belirler. Erken basmak turu bitirmez,
 * ölçümü geçersiz kılar ve baştan bekletir.
 */
export function ReactionGame({ onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const t = useT();

  const [phase, setPhase] = useState<Phase>('idle');
  const [times, setTimes] = useState<readonly number[]>([]);
  const [last, setLast] = useState<number | null>(null);

  const greenAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { report, finishNow } = useRoundFinish(onFinish, onProgress);

  /**
   * Ortalama yerine ortanca: beş ölçümün birinde dalınca ortalama
   * saniyelere fırlıyor ve iyi bir turu tek başına siliyor. Ortanca
   * tek sapmadan etkilenmiyor, tepki süresini daha dürüst veriyor.
   */
  const median =
    times.length === 0
      ? 0
      : ([...times].sort((a, b) => a - b)[Math.floor(times.length / 2)] as number);

  // Hızlı tepki yüksek puan getirmeli: 1000 ms'den geriye sayılıyor.
  const score = median === 0 ? 0 : Math.max(0, Math.round((1000 - median) / 5)) * times.length;

  useEffect(() => {
    report({
      score,
      level: times.length,
      completed: times.length >= TRIALS,
      label: `${times.length}/${TRIALS}`,
    });
  }, [report, score, times.length]);

  useEffect(() => {
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, []);

  const arm = useCallback(() => {
    setPhase('waiting');
    setLast(null);

    const wait = WAIT_MIN_MS + Math.random() * (WAIT_MAX_MS - WAIT_MIN_MS);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      greenAt.current = Date.now();
      setPhase('ready');
    }, wait);
  }, []);

  const press = useCallback(() => {
    tapFeedback();

    if (phase === 'idle' || phase === 'early') {
      arm();
      return;
    }

    if (phase === 'waiting') {
      // Yeşili beklemeden basıldı; sayaç iptal edilip baştan bekletilir.
      if (timer.current !== null) clearTimeout(timer.current);
      setPhase('early');
      return;
    }

    if (phase !== 'ready') return;

    const elapsed = Date.now() - greenAt.current;
    if (elapsed < HUMAN_FLOOR_MS) {
      setPhase('early');
      return;
    }

    const next = [...times, elapsed];
    setTimes(next);
    setLast(elapsed);

    if (next.length >= TRIALS) {
      setPhase('done');
      return;
    }

    arm();
  }, [arm, phase, times]);

  const finish = useCallback(() => {
    tapFeedback();
    finishNow();
  }, [finishNow]);

  const surface =
    phase === 'ready'
      ? palette.accentMath
      : phase === 'early'
        ? theme.colors.danger
        : theme.colors.surface;

  const headline =
    phase === 'idle'
      ? t('play.tapToStart')
      : phase === 'waiting'
        ? t('play.wait')
        : phase === 'ready'
          ? t('play.tapNow')
          : phase === 'early'
            ? t('play.tooEarly')
            : t('play.reactionMedian', { ms: median });

  const caption =
    phase === 'early'
      ? t('play.tapToRetry')
      : phase === 'done'
        ? t('play.bestMs', { ms: Math.min(...times) })
        : last !== null
          ? `${last} ms`
          : t('play.trialsOf', { done: times.length, total: TRIALS });

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={headline}
        disabled={phase === 'done'}
        onPress={press}
        style={[styles.pad, { backgroundColor: surface, borderColor: theme.colors.border }]}
      >
        <Text variant="heading">{headline}</Text>
        <Text variant="caption" color="textMuted" style={styles.caption}>
          {caption}
        </Text>
      </Pressable>

      {phase === 'done' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('play.finishRound')}
          onPress={finish}
          style={[styles.finish, { backgroundColor: theme.colors.brand }]}
        >
          <Text variant="bodyStrong" color="onBrand">
            {t('play.seeResult')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caption: {
    marginTop: spacing.xs,
  },
  finish: {
    alignItems: 'center',
    borderRadius: radius.md,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  pad: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 280,
    justifyContent: 'center',
    width: 300,
  },
  root: {
    alignItems: 'center',
  },
});
