import { radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { TIMED_ROUND_SECONDS, formatSeconds, useGameTimer } from '@/games/use-game-timer';
import { useRoundFinish } from '@/games/use-round-finish';
import { useT } from '@/lib/i18n';
import type { StringKey } from '@/lib/i18n';

/** Uyaranın ekranda kalma süresi; zorluk arttıkça kısalır. */
const STIMULUS_MS: Record<GameProps['difficulty'], number> = {
  easy: 1400,
  medium: 1050,
  hard: 780,
};

/** "Dur" uyaranının çıkma olasılığı — dürtü kontrolünü bu sınar. */
const NO_GO_RATE = 0.3;

type Stimulus = { kind: 'go' | 'nogo'; id: number } | null;

type Feedback = 'hit' | 'miss' | 'falseAlarm' | 'inhibit' | null;

const FEEDBACK_KEYS: Record<Exclude<Feedback, null>, StringKey> = {
  hit: 'play.correct',
  inhibit: 'play.goodStop',
  miss: 'play.missed',
  falseAlarm: 'play.shouldHaveStopped',
};

/**
 * Dur / Geç — süreli. Yeşil daire çıkınca dokun, kırmızı kare çıkınca
 * dokunma. Ölçtüğü şey tepki hızı değil, tepkiyi tutabilmek.
 */
export function GoNoGoGame({ difficulty, onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const t = useT();
  const stimulusMs = STIMULUS_MS[difficulty];

  const [stimulus, setStimulus] = useState<Stimulus>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [score, setScore] = useState(0);
  const [trials, setTrials] = useState(0);

  const respondedRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nextId = useRef(0);

  const { report, finishNow } = useRoundFinish(onFinish, onProgress);
  const remaining = useGameTimer(TIMED_ROUND_SECONDS, finishNow);

  useEffect(() => {
    report({ score, level: trials, completed: trials > 0, label: formatSeconds(remaining) });
  }, [remaining, report, score, trials]);

  // Zamanlayıcı kendini yeniden kurar; özyineleme ref üzerinden yapılır ki
  // callback kendi kimliğine bağımlı olmasın.
  const scheduleRef = useRef<() => void>(() => undefined);

  const scheduleNext = useCallback(() => {
    const gap = 500 + Math.random() * 700;

    timers.current.push(
      setTimeout(() => {
        const kind = Math.random() < NO_GO_RATE ? 'nogo' : 'go';
        nextId.current += 1;
        const id = nextId.current;

        respondedRef.current = false;
        setStimulus({ kind, id });
        setFeedback(null);

        timers.current.push(
          setTimeout(() => {
            setStimulus(null);
            setTrials((current) => current + 1);

            if (!respondedRef.current) {
              // Dokunmamak "dur" uyaranında doğru, "geç" uyaranında kaçırma.
              if (kind === 'nogo') {
                setScore((current) => current + 2);
                setFeedback('inhibit');
              } else {
                setScore((current) => Math.max(0, current - 1));
                setFeedback('miss');
              }
            }

            scheduleRef.current();
          }, stimulusMs),
        );
      }, gap),
    );
  }, [stimulusMs]);

  useEffect(() => {
    scheduleRef.current = scheduleNext;
  }, [scheduleNext]);

  useEffect(() => {
    // Oyun takıldığı anda ilk uyaranı zamanlar.
    scheduleNext();

    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
    };
  }, [scheduleNext]);

  const onTap = useCallback(() => {
    if (stimulus === null || respondedRef.current) return;

    respondedRef.current = true;
    tapFeedback();

    if (stimulus.kind === 'go') {
      setScore((current) => current + 3);
      setFeedback('hit');
    } else {
      setScore((current) => Math.max(0, current - 3));
      setFeedback('falseAlarm');
    }
  }, [stimulus]);

  const isGo = stimulus?.kind === 'go';
  const isNoGo = stimulus?.kind === 'nogo';

  return (
    <View style={styles.root}>
      <View style={styles.feedbackSlot}>
        {feedback !== null && (
          <Text
            variant="subheading"
            color={feedback === 'hit' || feedback === 'inhibit' ? 'success' : 'danger'}
          >
            {FEEDBACK_KEYS[feedback]}
          </Text>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('play.reactionArea')}
        onPress={onTap}
        style={[styles.stage, { backgroundColor: theme.colors.surface }]}
      >
        {isGo && <View style={[styles.goShape, { backgroundColor: theme.colors.success }]} />}
        {isNoGo && <View style={[styles.noGoShape, { backgroundColor: theme.colors.danger }]} />}
        {stimulus === null && (
          <Text variant="caption" color="textMuted">
            Hazır ol
          </Text>
        )}
      </Pressable>

      <Text variant="caption" color="textMuted" style={styles.hint}>
        Yeşil daireye dokun · kırmızı kareye dokunma
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  feedbackSlot: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
  },
  goShape: {
    borderRadius: radius.pill,
    height: 120,
    width: 120,
  },
  hint: {
    marginTop: spacing.lg,
    maxWidth: 260,
    textAlign: 'center',
  },
  noGoShape: {
    borderRadius: radius.md,
    height: 120,
    width: 120,
  },
  root: {
    alignItems: 'center',
  },
  stage: {
    alignItems: 'center',
    borderRadius: radius.xl,
    height: 280,
    justifyContent: 'center',
    marginTop: spacing.sm,
    width: 300,
  },
});
