import { IQ_MAX, IQ_MIN, REPORT_DIMENSIONS, type ScoreResult } from '@neuropeak/core';
import { spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Icon } from '@/components/icons';
import { BellCurve } from '@/components/test/bell-curve';
import { Badge, Button, Card, ProgressBar, Screen, Text, useTheme } from '@/components/ui';
import { usePro } from '@/lib/billing/context';
import { useLabels, useT } from '@/lib/i18n';

const COUNTER_DURATION_MS = 1_200;
const COUNTER_STEP_MS = 40;

/** Skoru sıfırdan sayarak açar; sonucun hak edilmiş hissettirmesi için. */
function useCountUp(target: number): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const steps = Math.max(1, Math.round(COUNTER_DURATION_MS / COUNTER_STEP_MS));
    let step = 0;

    const timer = setInterval(() => {
      step += 1;
      // Sona doğru yavaşlar.
      const progress = 1 - (1 - step / steps) ** 3;
      setValue(Math.round(target * Math.min(progress, 1)));

      if (step >= steps) {
        clearInterval(timer);
        setValue(target);
      }
    }, COUNTER_STEP_MS);

    return () => clearInterval(timer);
  }, [target]);

  return value;
}

type ScoreRevealProps = {
  result: ScoreResult;
  testTitle: string;
  onDone: () => void;
};

export function ScoreReveal({ result, testTitle, onDone }: ScoreRevealProps) {
  const theme = useTheme();
  const router = useRouter();
  const t = useT();
  const labels = useLabels();
  const { isPro } = usePro();
  const displayed = useCountUp(result.iq);

  const availableDimensions = REPORT_DIMENSIONS.filter(
    (dimension) => result.subscores[dimension] !== undefined,
  );

  const ranked = [...availableDimensions].sort(
    (a, b) => (result.subscores[b] ?? 0) - (result.subscores[a] ?? 0),
  );
  const strongest = ranked[0];
  const weakest = ranked.length > 1 ? ranked[ranked.length - 1] : undefined;

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <Text variant="overline" color="textMuted">
          {testTitle}
        </Text>
        <Text variant="display" color="brand">
          {displayed}
        </Text>
        <Badge label={labels.band(result.band)} tone="brand" />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(300)}>
        <Card padding="lg">
          <Text variant="subheading" align="center">
            {t('result.percentile', { percent: result.percentile.toFixed(0) })}
          </Text>
          <View style={styles.curve}>
            <BellCurve iq={result.iq} />
          </View>
          <Text variant="caption" color="textMuted" align="center">
            {t('result.correctAndTime', {
              correct: result.correctCount,
              total: result.answeredCount,
              minutes: Math.round(result.durationMs / 1000 / 60),
            })}
          </Text>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(300)} style={styles.section}>
        <Text variant="overline" color="textMuted" style={styles.sectionLabel}>
          {t('result.subscores')}
        </Text>

        <Card padding="lg">
          {availableDimensions.length > 0 ? (
            <View style={styles.dimensions}>
              {availableDimensions.map((dimension) => {
                const score = result.subscores[dimension] as number;
                return (
                  <View key={dimension} style={styles.dimension}>
                    <View style={styles.dimensionHead}>
                      <Text variant="caption">{labels.dimension(dimension)}</Text>
                      <Text variant="caption" color="textMuted">
                        {score}
                      </Text>
                    </View>
                    <ProgressBar
                      // Taban skorda çubuk tamamen kaybolup bozuk görünmesin.
                      value={Math.max(0.02, (score - IQ_MIN) / (IQ_MAX - IQ_MIN))}
                      accessibilityLabel={t('result.dimensionScoreLabel', {
                        dimension: labels.dimension(dimension),
                      })}
                    />
                  </View>
                );
              })}
            </View>
          ) : (
            <Text variant="bodySmall" color="textSecondary">
              {t('result.subscoresEmpty')}
            </Text>
          )}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).duration(300)} style={styles.section}>
        {isPro ? (
          <Card padding="lg">
            <Text variant="subheading" style={styles.lockedBody}>
              {t('result.highlights')}
            </Text>
            {strongest !== undefined && (
              <Text variant="bodySmall" color="textSecondary">
                {t('result.strongestPrefix')}
                <Text variant="bodySmall" color="brand">
                  {labels.dimension(strongest)}
                </Text>
                {t('result.strongestSuffix', { score: result.subscores[strongest] ?? 0 })}
              </Text>
            )}
            {weakest !== undefined && (
              <Text variant="bodySmall" color="textSecondary" style={styles.proLine}>
                {t('result.weakestPrefix')}
                <Text variant="bodySmall" color="brand">
                  {labels.dimension(weakest)}
                </Text>
                {t('result.weakestSuffix', { score: result.subscores[weakest] ?? 0 })}
              </Text>
            )}
          </Card>
        ) : (
          <Card padding="lg">
            <View style={styles.lockedHead}>
              <Icon name="lock" color={theme.colors.brand} size={20} />
              <Text variant="subheading">{t('result.lockedTitle')}</Text>
            </View>
            <Text variant="bodySmall" color="textSecondary" style={styles.lockedBody}>
              {t('result.lockedBody')}
            </Text>
            <Button
              label={t('result.unlockPro')}
              size="md"
              onPress={() => router.push({ pathname: '/paywall', params: { variant: 'result' } })}
            />
          </Card>
        )}
      </Animated.View>

      <Text variant="caption" color="textMuted" align="center" style={styles.disclaimer}>
        {t('common.testDisclaimer')}
      </Text>

      <View style={styles.actions}>
        <Button
          label={t('result.share')}
          variant="secondary"
          onPress={() => {
            // Paylaş düğmesi önce hiçbir şey yapmıyordu; işlemeyen bir
            // düğme, olmayan bir özelliği varmış gibi gösteriyor.
            void Share.share({
              message: t('result.shareText', { iq: result.iq, test: testTitle }),
            }).catch(() => undefined);
          }}
        />
        <Button label={t('common.done')} variant="ghost" size="md" onPress={onDone} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  curve: {
    marginVertical: spacing.md,
  },
  dimension: {
    gap: spacing.xs2,
  },
  dimensionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dimensions: {
    gap: spacing.md,
  },
  disclaimer: {
    marginTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xl,
  },
  lockedBody: {
    marginBottom: spacing.md,
  },
  proLine: {
    marginTop: spacing.sm,
  },
  lockedHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
});
