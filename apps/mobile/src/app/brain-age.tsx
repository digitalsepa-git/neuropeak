import { BRAIN_AGE_STEPS, brainAgeTest } from '@neuropeak/content';
import {
  MEANINGFUL_SPREAD,
  brainAge,
  focusScore,
  measureSpread,
  median,
  memoryScore,
  rankMeasures,
  reactionScore,
  speedScore,
  type BrainAgeMeasure,
  type BrainAgeScores,
} from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  FocusMeasure,
  MeasureIntro,
  ReactionMeasure,
  SpanMeasure,
  SpeedMeasure,
} from '@/components/brain-age/measures';
import { Button, Card, ProgressBar, Screen, Text, useTheme } from '@/components/ui';
import { track } from '@/lib/analytics';
import { useI18n, useT } from '@/lib/i18n';
import { useProgress } from '@/lib/progress/context';

type Phase = 'intro' | 'step-intro' | 'measuring' | 'result';

/** Ham ölçümler; sonuç ekranı bunları olduğu gibi gösteriyor. */
type Raw = {
  reactionMs: number;
  span: number;
  correctPerMinute: number;
  accuracy: number;
};

const EMPTY_RAW: Raw = { reactionMs: 0, span: 0, correctPerMinute: 0, accuracy: 0 };

/**
 * Beyin Yaşı Testi.
 *
 * Soru sormadığı için `test/[id]` akışından ayrı: o ekran soru
 * havuzu etrafında kurulu. Burada dört ölçüm sırayla çalışıyor ve
 * sonunda ham değerler bir yaşa çevriliyor.
 */
export default function BrainAgeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const { localized } = useI18n();
  const { recordTestFinished } = useProgress();

  const [phase, setPhase] = useState<Phase>('intro');
  const [stepIndex, setStepIndex] = useState(0);
  const [raw, setRaw] = useState<Raw>(EMPTY_RAW);
  const [scores, setScores] = useState<BrainAgeScores | null>(null);
  // Hız ölçümünün tohumu; ölçüm başlarken bir kez üretiliyor.
  const [seed, setSeed] = useState(1);

  const step = BRAIN_AGE_STEPS[stepIndex];

  const finish = useCallback(
    (final: Raw) => {
      const computed: BrainAgeScores = {
        reaction: reactionScore(final.reactionMs),
        memory: memoryScore(final.span),
        speed: speedScore(final.correctPerMinute),
        focus: focusScore(final.accuracy),
      };

      setScores(computed);
      setPhase('result');

      track('test_complete', { test: brainAgeTest.id, iq: brainAge(computed) });
      // Beyin yaşı bir IQ puanı değil; ilerlemeye test tamamlama
      // olarak işleniyor ve IQ alanına taban puan yazılmıyor.
      void recordTestFinished(0);
    },
    [recordTestFinished],
  );

  const advance = useCallback(
    (next: Raw) => {
      setRaw(next);
      if (stepIndex + 1 >= BRAIN_AGE_STEPS.length) {
        finish(next);
        return;
      }
      setStepIndex(stepIndex + 1);
      setPhase('step-intro');
    },
    [finish, stepIndex],
  );

  if (phase === 'intro') {
    const totalSeconds = BRAIN_AGE_STEPS.reduce((sum, item) => sum + item.seconds, 0);

    return (
      <Screen scroll>
        <View style={styles.intro}>
          <Text variant="overline" color="brand">
            {t('brainAge.stepCount', {
              count: BRAIN_AGE_STEPS.length,
              minutes: Math.ceil(totalSeconds / 60),
            })}
          </Text>
          <Text variant="title">{localized(brainAgeTest.title)}</Text>
          <Text variant="body" color="textSecondary">
            {localized(brainAgeTest.description)}
          </Text>
        </View>

        <Card padding="lg">
          <Text variant="bodySmall" color="textSecondary">
            {localized(brainAgeTest.caveat)}
          </Text>
        </Card>

        <View style={styles.steps}>
          {BRAIN_AGE_STEPS.map((item, index) => (
            <Card key={item.measure} padding="sm">
              <View style={styles.stepRow}>
                <Text variant="caption" color="textMuted">
                  {index + 1}
                </Text>
                <View style={styles.stepText}>
                  <Text variant="bodyStrong">{localized(item.title)}</Text>
                  <Text variant="caption" color="textMuted">
                    {localized(item.instruction)}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <Text variant="caption" color="textMuted" style={styles.disclaimer}>
          {t('common.testDisclaimer')}
        </Text>

        <View style={styles.action}>
          <Button
            label={t('test.start')}
            onPress={() => {
              track('test_start', { test: brainAgeTest.id, questions: BRAIN_AGE_STEPS.length });
              setPhase('step-intro');
            }}
          />
          <Button
            label={t('common.goBack')}
            variant="ghost"
            size="md"
            onPress={() => router.back()}
          />
        </View>
      </Screen>
    );
  }

  if (phase === 'result' && scores !== null) {
    const age = brainAge(scores);
    const ranked = rankMeasures(scores);
    const strongest = ranked[0] as BrainAgeMeasure;
    const weakest = ranked[ranked.length - 1] as BrainAgeMeasure;

    return (
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(300)} style={styles.resultHead}>
          <Text variant="overline" color="textMuted">
            {localized(brainAgeTest.title)}
          </Text>
          <Text variant="display" color="brand">
            {age}
          </Text>
          <Text variant="bodySmall" color="textSecondary">
            {t('brainAge.scaleNote')}
          </Text>
        </Animated.View>

        <Card padding="lg">
          <Text variant="overline" color="textMuted" style={styles.sectionLabel}>
            {t('brainAge.measurements')}
          </Text>
          <View style={styles.measures}>
            <Measurement
              label={t('brainAge.measure.reaction')}
              value={t('brainAge.valueMs', { value: Math.round(raw.reactionMs) })}
              ratio={scores.reaction}
            />
            <Measurement
              label={t('brainAge.measure.memory')}
              value={t('brainAge.valueDigits', { value: raw.span })}
              ratio={scores.memory}
            />
            <Measurement
              label={t('brainAge.measure.speed')}
              value={t('brainAge.valuePerMinute', { value: Math.round(raw.correctPerMinute) })}
              ratio={scores.speed}
            />
            <Measurement
              label={t('brainAge.measure.focus')}
              value={t('brainAge.valuePercent', { value: Math.round(raw.accuracy * 100) })}
              ratio={scores.focus}
            />
          </View>
        </Card>

        <Card padding="lg">
          {/* Dördü de aynı çıktığında "en güçlü ölçümün şu" demek
              yanıltıcı olurdu: listenin başındaki, yalnızca sırası
              yüzünden başta duruyor. */}
          {measureSpread(scores) < MEANINGFUL_SPREAD ? (
            <Text variant="bodySmall" color="textSecondary">
              {t('brainAge.evenSpread')}
            </Text>
          ) : (
            <>
              <Text variant="bodySmall" color="textSecondary">
                {t('brainAge.strongest', { measure: t(`brainAge.measure.${strongest}`) })}
              </Text>
              <Text variant="bodySmall" color="textSecondary" style={styles.weakest}>
                {t('brainAge.weakest', { measure: t(`brainAge.measure.${weakest}`) })}
              </Text>
            </>
          )}
        </Card>

        <Text variant="caption" color="textMuted" align="center" style={styles.disclaimer}>
          {localized(brainAgeTest.caveat)}
        </Text>

        <View style={styles.action}>
          <Button label={t('common.done')} onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  if (step === undefined) return <Screen />;

  return (
    <Screen>
      <View style={styles.progress}>
        <Text variant="caption" color="textMuted">
          {t('brainAge.stepProgress', {
            index: stepIndex + 1,
            total: BRAIN_AGE_STEPS.length,
            title: localized(step.title),
          })}
        </Text>
        <ProgressBar
          value={(stepIndex + (phase === 'measuring' ? 0.5 : 0)) / BRAIN_AGE_STEPS.length}
          height={6}
          accessibilityLabel={t('test.progressLabel')}
        />
      </View>

      {phase === 'step-intro' ? (
        <MeasureIntro
          title={localized(step.title)}
          instruction={localized(step.instruction)}
          onStart={() => {
            setSeed(Date.now());
            setPhase('measuring');
          }}
        />
      ) : (
        <View style={[styles.stage, { backgroundColor: theme.colors.surfaceSunken }]}>
          {step.measure === 'reaction' && (
            <ReactionMeasure
              onDone={(samples) => advance({ ...raw, reactionMs: median(samples) })}
            />
          )}
          {step.measure === 'memory' && (
            <SpanMeasure onDone={(span) => advance({ ...raw, span })} />
          )}
          {step.measure === 'speed' && (
            <SpeedMeasure
              seconds={step.seconds}
              seed={seed}
              onDone={(correct) =>
                advance({ ...raw, correctPerMinute: (correct * 60) / step.seconds })
              }
            />
          )}
          {step.measure === 'focus' && (
            <FocusMeasure
              seconds={step.seconds}
              onDone={(accuracy) => advance({ ...raw, accuracy })}
            />
          )}
        </View>
      )}
    </Screen>
  );
}

function Measurement({ label, value, ratio }: { label: string; value: string; ratio: number }) {
  return (
    <View style={styles.measure}>
      <View style={styles.measureHead}>
        <Text variant="caption">{label}</Text>
        <Text variant="caption" color="textMuted">
          {value}
        </Text>
      </View>
      <ProgressBar value={ratio} accessibilityLabel={`${label} ${value}`} />
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  disclaimer: {
    marginTop: spacing.lg,
  },
  intro: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
    paddingTop: spacing.lg,
  },
  measure: {
    gap: spacing.xs2,
  },
  measureHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  measures: {
    gap: spacing.md,
  },
  progress: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  resultHead: {
    alignItems: 'center',
    gap: spacing.xs2,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  stage: {
    borderRadius: radius.lg,
    flex: 1,
    overflow: 'hidden',
  },
  stepRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepText: {
    flex: 1,
    gap: spacing.xs2,
  },
  steps: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  weakest: {
    marginTop: spacing.xs,
  },
});
