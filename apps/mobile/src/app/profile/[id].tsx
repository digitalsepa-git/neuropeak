import { findProfileTest } from '@neuropeak/content';
import {
  MEANINGFUL_TRAIT_SPREAD,
  rankOutcomes,
  rankTraits,
  scoreProfile,
  traitSpread,
} from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeOutLeft } from 'react-native-reanimated';

import { Button, Card, ProgressBar, Screen, Text, tapFeedback, useTheme } from '@/components/ui';
import { track } from '@/lib/analytics';
import { useI18n, useT } from '@/lib/i18n';
import { useProgress } from '@/lib/progress/context';

/**
 * Profil testleri: Zihin Arketipi, Odaklanma Profili, Kişilik Haritası.
 *
 * IQ testlerinden ayrı bir ekran, çünkü doğru cevap yok: seçim
 * işaretlenip geçiliyor, doğru/yanlış geri bildirimi verilmiyor ve
 * sonuçta puan değil bir profil gösteriliyor.
 */
export default function ProfileTestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const { localized } = useI18n();
  const { recordTestFinished } = useProgress();

  const test = findProfileTest(id ?? '');

  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [done, setDone] = useState(false);

  const answer = useCallback(
    (optionIndex: number) => {
      if (test === undefined) return;

      tapFeedback();
      const next = [...answers];
      next[index] = optionIndex;
      setAnswers(next);

      if (index + 1 >= test.questions.length) {
        setDone(true);
        track('test_complete', { test: test.id });
        // Profil testinin IQ puanı yok; ilerlemeye test tamamlama
        // olarak işleniyor.
        void recordTestFinished(0);
        return;
      }

      setIndex(index + 1);
    },
    [answers, index, recordTestFinished, test],
  );

  if (test === undefined) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text variant="heading">{t('test.notFound')}</Text>
          <Button label={t('common.goBack')} variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  if (!started) {
    return (
      <Screen scroll>
        <View style={styles.intro}>
          <Text variant="overline" color="brand">
            {t('common.questionCount', { count: test.questions.length })} ·{' '}
            {t('common.minutesShort', {
              value: `${test.estMinutes[0]}-${test.estMinutes[1]}`,
            })}
          </Text>
          <Text variant="title">{localized(test.title)}</Text>
          <Text variant="body" color="textSecondary">
            {localized(test.description)}
          </Text>
        </View>

        <Card padding="lg">
          <Text variant="bodySmall" color="textSecondary">
            {localized(test.caveat)}
          </Text>
        </Card>

        <Text variant="overline" color="textMuted" style={styles.sectionLabel}>
          {t('profile.axes')}
        </Text>
        <View style={styles.list}>
          {test.traits.map((trait) => (
            <Card key={trait.id} padding="sm">
              <Text variant="bodyStrong">{localized(trait.label)}</Text>
              <Text variant="caption" color="textMuted">
                {localized(trait.description)}
              </Text>
            </Card>
          ))}
        </View>

        <View style={styles.action}>
          <Button
            label={t('test.start')}
            onPress={() => {
              track('test_start', { test: test.id, questions: test.questions.length });
              setStarted(true);
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

  if (done) {
    const scores = scoreProfile(test.questions, answers);
    const ranked = rankTraits(scores);
    const spread = traitSpread(scores);
    const highest = test.traits.find((trait) => trait.id === ranked[0]);
    const lowest = test.traits.find((trait) => trait.id === ranked[ranked.length - 1]);

    // Arketipli testlerde tek sonuç; eksenler birbirine çok yakınsa
    // bir arketibe yerleştirmek uydurma olurdu.
    const winner =
      test.outcomes === undefined
        ? undefined
        : spread < MEANINGFUL_TRAIT_SPREAD
          ? test.balanced
          : rankOutcomes(test.outcomes, scores)[0]?.outcome;

    return (
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(300)} style={styles.resultHead}>
          <Text variant="overline" color="textMuted">
            {localized(test.title)}
          </Text>
          {winner === undefined ? (
            <Text variant="title" align="center">
              {t('profile.yourMap')}
            </Text>
          ) : (
            <Text variant="display" color="brand" align="center">
              {localized(winner.title)}
            </Text>
          )}
        </Animated.View>

        {winner !== undefined && (
          <Card padding="lg">
            <Text variant="body" color="textSecondary">
              {localized(winner.description)}
            </Text>
          </Card>
        )}

        <Card padding="lg">
          <Text variant="overline" color="textMuted" style={styles.sectionLabel}>
            {t('profile.axes')}
          </Text>
          <View style={styles.axes}>
            {test.traits.map((trait) => (
              <View key={trait.id} style={styles.axis}>
                <View style={styles.axisHead}>
                  <Text variant="caption">{localized(trait.label)}</Text>
                  <Text variant="caption" color="textMuted">
                    {t('profile.percent', {
                      value: Math.round((scores[trait.id] ?? 0) * 100),
                    })}
                  </Text>
                </View>
                <ProgressBar
                  value={scores[trait.id] ?? 0}
                  accessibilityLabel={`${localized(trait.label)} ${Math.round(
                    (scores[trait.id] ?? 0) * 100,
                  )}`}
                />
              </View>
            ))}
          </View>
        </Card>

        <Card padding="lg">
          {/* Eksenler birbirine yakınken "şu ekseni öne çıkıyor"
              demek, sıralamanın başındaki ekseni sırf sırası yüzünden
              öne çıkarmak olurdu. */}
          {spread < MEANINGFUL_TRAIT_SPREAD || highest === undefined || lowest === undefined ? (
            <Text variant="bodySmall" color="textSecondary">
              {t('profile.evenSpread')}
            </Text>
          ) : (
            <>
              <Text variant="bodySmall" color="textSecondary">
                {t('profile.highest', { trait: localized(highest.label) })}
              </Text>
              <Text variant="bodySmall" color="textSecondary" style={styles.lowest}>
                {t('profile.lowest', { trait: localized(lowest.label) })}
              </Text>
            </>
          )}
        </Card>

        <Text variant="caption" color="textMuted" align="center" style={styles.disclaimer}>
          {localized(test.caveat)}
        </Text>

        <View style={styles.action}>
          <Button label={t('common.done')} onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const question = test.questions[index];
  if (question === undefined) return <Screen />;

  return (
    <Screen>
      <View style={styles.runnerHead}>
        <View style={styles.runnerRow}>
          <Text variant="caption" color="textMuted">
            {t('test.questionCounter', { index: index + 1, total: test.questions.length })}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('test.exit')}
            hitSlop={10}
            onPress={() => router.back()}
          >
            <Text variant="caption" color="textMuted">
              {t('common.exit')}
            </Text>
          </Pressable>
        </View>
        <ProgressBar
          value={(index + 1) / test.questions.length}
          height={6}
          accessibilityLabel={t('test.progressLabel')}
        />
      </View>

      <Animated.View
        key={question.id}
        entering={FadeInRight.duration(200)}
        exiting={FadeOutLeft.duration(140)}
        style={styles.questionArea}
      >
        <Text variant="heading" align="center" style={styles.prompt}>
          {localized(question.prompt)}
        </Text>

        <View style={styles.options}>
          {question.options.map((option, optionIndex) => (
            <Pressable
              key={`${question.id}-${optionIndex}`}
              accessibilityRole="button"
              accessibilityLabel={localized(option.label)}
              onPress={() => answer(optionIndex)}
              style={[
                styles.option,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <Text variant="body">{localized(option.label)}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  action: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  axes: {
    gap: spacing.md,
  },
  axis: {
    gap: spacing.xs2,
  },
  axisHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  disclaimer: {
    marginTop: spacing.lg,
  },
  intro: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
    paddingTop: spacing.lg,
  },
  list: {
    gap: spacing.xs,
  },
  lowest: {
    marginTop: spacing.xs,
  },
  option: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  options: {
    gap: spacing.xs,
  },
  prompt: {
    marginBottom: spacing.xl,
  },
  questionArea: {
    flex: 1,
    justifyContent: 'center',
  },
  resultHead: {
    alignItems: 'center',
    gap: spacing.xs2,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xl,
  },
  runnerHead: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  runnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
});
