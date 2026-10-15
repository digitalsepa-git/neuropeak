import {
  IQ_MAX,
  IQ_MIN,
  REPORT_DIMENSIONS,
  type ReportDimension,
  type ScoreResult,
} from '@neuropeak/core';
import { spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Icon } from '@/components/icons';
import { BellCurve } from '@/components/test/bell-curve';
import { Badge, Button, Card, ProgressBar, Screen, Text, useTheme } from '@/components/ui';
import { usePro } from '@/lib/billing/context';

const BAND_LABELS: Record<ScoreResult['band'], string> = {
  developing: 'Gelişime açık',
  average: 'Ortalama',
  aboveAverage: 'Ortalama üstü',
  superior: 'Üstün',
  exceptional: 'Olağanüstü',
};

const DIMENSION_LABELS: Record<ReportDimension, string> = {
  verbal: 'Sözel',
  numeric: 'Sayısal',
  visual: 'Görsel',
  logical: 'Mantıksal',
};

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
        <Badge label={BAND_LABELS[result.band]} tone="brand" />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(300)}>
        <Card padding="lg">
          <Text variant="subheading" align="center">
            Katılanların %{result.percentile.toFixed(0)}&apos;inden daha iyisin
          </Text>
          <View style={styles.curve}>
            <BellCurve iq={result.iq} />
          </View>
          <Text variant="caption" color="textMuted" align="center">
            {result.correctCount}/{result.answeredCount} doğru ·{' '}
            {Math.round(result.durationMs / 1000 / 60)} dk
          </Text>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(300)} style={styles.section}>
        <Text variant="overline" color="textMuted" style={styles.sectionLabel}>
          Alt boyutlar
        </Text>

        <Card padding="lg">
          {availableDimensions.length > 0 ? (
            <View style={styles.dimensions}>
              {availableDimensions.map((dimension) => {
                const score = result.subscores[dimension] as number;
                return (
                  <View key={dimension} style={styles.dimension}>
                    <View style={styles.dimensionHead}>
                      <Text variant="caption">{DIMENSION_LABELS[dimension]}</Text>
                      <Text variant="caption" color="textMuted">
                        {score}
                      </Text>
                    </View>
                    <ProgressBar
                      // Taban skorda çubuk tamamen kaybolup bozuk görünmesin.
                      value={Math.max(0.02, (score - IQ_MIN) / (IQ_MAX - IQ_MIN))}
                      accessibilityLabel={`${DIMENSION_LABELS[dimension]} puanı`}
                    />
                  </View>
                );
              })}
            </View>
          ) : (
            <Text variant="bodySmall" color="textSecondary">
              Bu oturumda alt boyut raporu için yeterli soru yoktu.
            </Text>
          )}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).duration(300)} style={styles.section}>
        {isPro ? (
          <Card padding="lg">
            <Text variant="subheading" style={styles.lockedBody}>
              Senin için öne çıkanlar
            </Text>
            {strongest !== undefined && (
              <Text variant="bodySmall" color="textSecondary">
                En güçlü alanın{' '}
                <Text variant="bodySmall" color="brand">
                  {DIMENSION_LABELS[strongest]}
                </Text>{' '}
                ({result.subscores[strongest]}). Bu alandaki oyunlarda zorluk seviyeni
                yükseltebilirsin.
              </Text>
            )}
            {weakest !== undefined && (
              <Text variant="bodySmall" color="textSecondary" style={styles.proLine}>
                En çok gelişime açık alanın{' '}
                <Text variant="bodySmall" color="brand">
                  {DIMENSION_LABELS[weakest]}
                </Text>{' '}
                ({result.subscores[weakest]}). Günlük planına bu kategoriden bir oyun eklendi.
              </Text>
            )}
          </Card>
        ) : (
          <Card padding="lg">
            <View style={styles.lockedHead}>
              <Icon name="lock" color={theme.colors.brand} size={20} />
              <Text variant="subheading">Detaylı rapor</Text>
            </View>
            <Text variant="bodySmall" color="textSecondary" style={styles.lockedBody}>
              Güçlü ve zayıf alanlarının açıklaması, yaş grubuna göre karşılaştırma ve sana özel
              gelişim planı PRO ile açılır.
            </Text>
            <Button
              label="PRO ile aç"
              size="md"
              onPress={() => router.push({ pathname: '/paywall', params: { variant: 'result' } })}
            />
          </Card>
        )}
      </Animated.View>

      <Text variant="caption" color="textMuted" align="center" style={styles.disclaimer}>
        Bu test eğlence ve zihinsel egzersiz amaçlıdır; klinik veya psikometrik bir teşhis aracı
        değildir.
      </Text>

      <View style={styles.actions}>
        <Button label="Sonucu paylaş" variant="secondary" onPress={() => {}} />
        <Button label="Bitti" variant="ghost" size="md" onPress={onDone} />
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
