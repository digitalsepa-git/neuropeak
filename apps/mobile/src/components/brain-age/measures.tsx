import { generateQuickMath } from '@neuropeak/core';
import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Text, tapFeedback, useTheme } from '@/components/ui';
import { useT } from '@/lib/i18n';

/**
 * Beyin Yaşı testinin dört ölçümü.
 *
 * Oyunlardan ayrı yazıldılar: oyunlar puan, seviye ve XP etrafında
 * kurulu, burada tek işleri ham bir sayı üretmek. Her ölçüm bitince
 * `onDone` ile o sayıyı veriyor.
 */

/** Tepki ölçümü: beş deneme, sonuç milisaniye dizisi. */
export function ReactionMeasure({ onDone }: { onDone: (samples: number[]) => void }) {
  const theme = useTheme();
  const t = useT();

  const [phase, setPhase] = useState<'waiting' | 'go' | 'early'>('waiting');
  const [round, setRound] = useState(0);
  const [samples, setSamples] = useState<number[]>([]);

  const startedAt = useRef(0);

  // Yeşile dönme zamanlayıcısı; etki gövdesinde durum değiştirmiyor,
  // yalnızca zamanlayıcıyı kuruyor. Her yeni tur `round` değişerek
  // başlıyor.
  useEffect(() => {
    if (phase !== 'waiting') return;

    // Bekleme süresi rastgele: sabit olsa ritmi öğrenip erken basmak
    // mümkün olurdu ve ölçülen şey tepki olmaktan çıkardı.
    const timer = setTimeout(
      () => {
        startedAt.current = Date.now();
        setPhase('go');
      },
      1200 + Math.random() * 2300,
    );

    return () => clearTimeout(timer);
  }, [phase, round]);

  const arm = useCallback(() => {
    setRound((current) => current + 1);
    setPhase('waiting');
  }, []);

  const press = () => {
    if (phase === 'waiting') {
      setPhase('early');
      return;
    }

    if (phase === 'go') {
      tapFeedback();
      const next = [...samples, Date.now() - startedAt.current];
      setSamples(next);
      if (next.length >= 5) {
        onDone(next);
        return;
      }
      arm();
      return;
    }

    if (phase === 'early') arm();
  };

  const background =
    phase === 'go'
      ? palette.accentMath
      : phase === 'early'
        ? theme.colors.danger
        : theme.colors.surface;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('play.reactionArea')}
      onPress={press}
      style={[styles.stage, { backgroundColor: background }]}
    >
      <Text variant="heading" align="center">
        {phase === 'go'
          ? t('play.tapNow')
          : phase === 'early'
            ? t('play.tooEarly')
            : t('play.wait')}
      </Text>
      <Text variant="caption" color="textMuted" style={styles.counter}>
        {t('brainAge.trialCounter', { done: samples.length, total: 5 })}
      </Text>
    </Pressable>
  );
}

const SPAN_START = 3;
const SPAN_LIVES = 2;

/** Hane menzili: doğru bildikçe uzuyor, iki hak. Sonuç en uzun doğru menzil. */
export function SpanMeasure({ onDone }: { onDone: (span: number) => void }) {
  const theme = useTheme();
  const t = useT();

  const randomDigits = (size: number) =>
    Array.from({ length: size }, () => Math.floor(Math.random() * 10));

  const [length, setLength] = useState(SPAN_START);
  // İlk tur ilk render'da hazır: etki içinde kurmak bir tur boş ekran
  // gösteriyordu.
  const [digits, setDigits] = useState<number[]>(() => randomDigits(SPAN_START));
  const [shown, setShown] = useState(0);
  const [entry, setEntry] = useState('');
  const [lives, setLives] = useState(SPAN_LIVES);
  const [best, setBest] = useState(0);

  const startRound = useCallback((size: number) => {
    setDigits(randomDigits(size));
    setEntry('');
    setShown(0);
  }, []);

  useEffect(() => {
    if (shown >= digits.length) return;

    const timer = setTimeout(() => setShown((current) => current + 1), 800);
    return () => clearTimeout(timer);
  }, [digits.length, shown]);

  const showing = shown < digits.length;

  const submit = () => {
    const correct = entry === digits.join('');
    if (correct) {
      setBest(length);
      setLength(length + 1);
      startRound(length + 1);
      return;
    }

    const left = lives - 1;
    setLives(left);
    if (left <= 0) {
      onDone(best);
      return;
    }
    startRound(length);
  };

  return (
    <View style={styles.stage}>
      {showing ? (
        <Text variant="display" color="brand">
          {digits[shown]}
        </Text>
      ) : (
        <>
          <Text variant="heading">{entry.length === 0 ? '—' : entry}</Text>
          <View style={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'submit'].map((key) => (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={
                  key === 'clear' ? t('play.clear') : key === 'submit' ? t('play.confirm') : key
                }
                onPress={() => {
                  tapFeedback();
                  if (key === 'clear') setEntry('');
                  else if (key === 'submit') submit();
                  else if (entry.length < digits.length) setEntry(entry + key);
                }}
                style={[styles.key, { backgroundColor: theme.colors.surfaceElevated }]}
              >
                <Text variant="bodyStrong">
                  {key === 'clear' ? '⌫' : key === 'submit' ? '✓' : key}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text variant="caption" color="textMuted">
            {t('brainAge.livesLeft', { lives })}
          </Text>
        </>
      )}
    </View>
  );
}

/** İşlem hızı: sabit sürede kaç doğru. */
export function SpeedMeasure({
  seconds,
  seed,
  onDone,
}: {
  seconds: number;
  /** Soruların tohumu; ölçüm başlarken bir kez üretiliyor. */
  seed: number;
  onDone: (correct: number) => void;
}) {
  const theme = useTheme();
  const [problem, setProblem] = useState(() => generateQuickMath('medium', seed));
  const [correct, setCorrect] = useState(0);
  const [remaining, setRemaining] = useState(seconds);

  const correctRef = useRef(0);
  const seenRef = useRef(0);
  const finished = useRef(false);

  useEffect(() => {
    const tick = setInterval(() => setRemaining((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (remaining === 0 && !finished.current) {
      finished.current = true;
      onDone(correctRef.current);
    }
  }, [onDone, remaining]);

  const answer = (option: number) => {
    tapFeedback();
    if (option === problem.answer) {
      correctRef.current += 1;
      setCorrect(correctRef.current);
    }
    // Tohum sayaçla ilerliyor: render sırasında saat okunmuyor ve
    // aynı ölçüm tekrar edilebilir kalıyor.
    seenRef.current += 1;
    setProblem(generateQuickMath('medium', seed + seenRef.current * 7919));
  };

  return (
    <View style={styles.stage}>
      <Text variant="caption" color="textMuted">
        {remaining}
      </Text>
      <Text variant="display" color="brand">
        {problem.text}
      </Text>
      <View style={styles.options}>
        {problem.options.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityLabel={String(option)}
            onPress={() => answer(option)}
            style={[styles.option, { backgroundColor: theme.colors.surfaceElevated }]}
          >
            <Text variant="bodyStrong">{option}</Text>
          </Pressable>
        ))}
      </View>
      <Text variant="caption" color="textMuted">
        {correct}
      </Text>
    </View>
  );
}

const GO_INTERVAL_MS = 1100;
const NO_GO_RATE = 0.3;

/** Dürtü kontrolü: doğru tepki oranı. */
export function FocusMeasure({
  seconds,
  onDone,
}: {
  seconds: number;
  onDone: (accuracy: number) => void;
}) {
  const theme = useTheme();
  const t = useT();

  const [stimulus, setStimulus] = useState<'go' | 'nogo' | null>(null);
  const [remaining, setRemaining] = useState(seconds);

  const totals = useRef({ shown: 0, correct: 0 });
  const answered = useRef(false);
  const finished = useRef(false);

  useEffect(() => {
    const tick = setInterval(() => setRemaining((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const loop = setInterval(() => {
      // Önceki uyaran cevapsız kapandıysa doğru olup olmadığına karar
      // verilir: "geç" uyaranında dokunmamak doğru, "dur"da yanlış.
      setStimulus((current) => {
        if (current !== null && !answered.current && current === 'nogo') {
          totals.current.correct += 1;
        }
        answered.current = false;
        totals.current.shown += 1;
        return Math.random() < NO_GO_RATE ? 'nogo' : 'go';
      });
    }, GO_INTERVAL_MS);

    return () => clearInterval(loop);
  }, []);

  useEffect(() => {
    if (remaining === 0 && !finished.current) {
      finished.current = true;
      const { shown, correct } = totals.current;
      onDone(shown === 0 ? 0 : correct / shown);
    }
  }, [onDone, remaining]);

  const press = () => {
    if (stimulus === null || answered.current) return;
    answered.current = true;
    tapFeedback();
    if (stimulus === 'go') totals.current.correct += 1;
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('play.reactionArea')}
      onPress={press}
      style={[styles.stage, { backgroundColor: theme.colors.surface }]}
    >
      <Text variant="caption" color="textMuted">
        {remaining}
      </Text>
      {stimulus === 'go' && <View style={[styles.go, { backgroundColor: palette.accentMath }]} />}
      {stimulus === 'nogo' && (
        <View style={[styles.nogo, { backgroundColor: theme.colors.danger }]} />
      )}
    </Pressable>
  );
}

export function MeasureIntro({
  title,
  instruction,
  onStart,
}: {
  title: string;
  instruction: string;
  onStart: () => void;
}) {
  const t = useT();

  return (
    <View style={styles.intro}>
      <Text variant="title" align="center">
        {title}
      </Text>
      <Text variant="body" color="textSecondary" align="center">
        {instruction}
      </Text>
      <View style={styles.introAction}>
        <Button label={t('game.start')} onPress={onStart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  counter: {
    marginTop: spacing.sm,
  },
  go: {
    borderRadius: radius.pill,
    height: 120,
    width: 120,
  },
  intro: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  introAction: {
    marginTop: spacing.lg,
    width: '100%',
  },
  key: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexBasis: '30%',
    paddingVertical: spacing.sm,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    marginVertical: spacing.lg,
    width: 260,
  },
  nogo: {
    borderRadius: radius.md,
    height: 120,
    width: 120,
  },
  option: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexBasis: '45%',
    paddingVertical: spacing.md,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.xl,
    width: 300,
  },
  stage: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    width: '100%',
  },
});
