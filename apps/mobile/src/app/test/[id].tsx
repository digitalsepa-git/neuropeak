import {
  createRng,
  sample,
  scoreTest,
  seedFromString,
  type AnsweredQuestion,
  type QuestionKind,
  type ScoreResult,
} from '@neuropeak/core';
import { findTest, type ContentQuestion } from '@neuropeak/content';
import { radius, spacing } from '@neuropeak/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

import { Icon } from '@/components/icons';
import { ScoreReveal } from '@/components/test/score-reveal';
import { Button, Card, ProgressBar, Screen, Text, tapFeedback, useTheme } from '@/components/ui';
import { useAds } from '@/lib/ads/context';
import { track } from '@/lib/analytics';
import { useI18n, useLabels, useT } from '@/lib/i18n';
import { useProgress } from '@/lib/progress/context';
import { enqueueMutation } from '@/lib/sync';
import { saveTestResult, type StoredTestResult } from '@/lib/test-results';

type Phase = 'intro' | 'running' | 'result';

/**
 * Havuzda en çok geçen üç soru türü.
 *
 * Liste önceden sabitti ve Sözel IQ testinin girişinde "sayı
 * dizilerini çözme" yazıyordu; artık testin kendi havuzundan
 * türetiliyor, metinleri de i18n kataloğundan geliyor.
 */
function topKinds(questions: readonly ContentQuestion[]): QuestionKind[] {
  const counts = new Map<QuestionKind, number>();
  for (const question of questions) {
    counts.set(question.kind, (counts.get(question.kind) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([kind]) => kind);
}

export default function TestRunnerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const { localized } = useI18n();
  const labels = useLabels();
  const { recordTestFinished } = useProgress();
  const { afterRound } = useAds();

  const test = findTest(id ?? '');

  const [phase, setPhase] = useState<Phase>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);

  // Oturum kimliği teste başlanınca üretilir: render saf kalsın ve her
  // deneme kendi soru alt kümesini alsın.
  const [sessionSeed, setSessionSeed] = useState<string | null>(null);

  const answersRef = useRef<AnsweredQuestion[]>([]);
  const questionStartedAt = useRef<number>(0);

  // Havuzdan oturuma özel bir alt küme seçilir; test tekrarlandığında
  // aynı sorular gelmez ama bir oturum içinde sıra sabit kalır.
  const questions = useMemo<ContentQuestion[]>(() => {
    if (test === undefined || sessionSeed === null) return [];
    const rng = createRng(seedFromString(sessionSeed));
    return sample(test.questions, test.questionCount, rng);
  }, [sessionSeed, test]);

  const finish = useCallback(
    async (answers: AnsweredQuestion[]) => {
      if (test === undefined) return;

      const score = scoreTest(answers, test.norm);
      setResult(score);
      setPhase('result');

      const stored: StoredTestResult = {
        id: `${test.id}-${Date.now()}`,
        testId: test.id,
        completedAt: new Date().toISOString(),
        score,
      };

      track('test_complete', {
        test: test.id,
        iq: score.iq,
        correct: answers.filter((answer) => answer.isCorrect).length,
        total: answers.length,
      });

      await saveTestResult(stored);
      await enqueueMutation({ kind: 'test_result', payload: stored });
      // XP, yıldız, seri ve günlük görevler tek kapıdan işlenir.
      await recordTestFinished(score.iq);
    },
    [recordTestFinished, test],
  );

  const answer = useCallback(
    (optionIndex: number) => {
      const question = questions[questionIndex];
      if (question === undefined) return;

      tapFeedback();
      setSelectedIndex(optionIndex);

      const elapsedMs = Date.now() - questionStartedAt.current;
      answersRef.current = [
        ...answersRef.current,
        {
          questionId: question.id,
          kind: question.kind,
          difficultyWeight: question.difficultyWeight,
          isCorrect: optionIndex === question.correctIndex,
          elapsedMs,
        },
      ];

      // Seçim kısa süre görünür kalsın, sonra sıradaki soruya geçilsin.
      setTimeout(() => {
        setSelectedIndex(null);
        if (questionIndex + 1 >= questions.length) {
          void finish(answersRef.current);
        } else {
          questionStartedAt.current = Date.now();
          setQuestionIndex((current) => current + 1);
        }
      }, 180);
    },
    [finish, questionIndex, questions],
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

  if (phase === 'intro') {
    return (
      <Screen scroll>
        <View style={styles.introHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            hitSlop={10}
            onPress={() => router.back()}
          >
            <Icon name="chevronRight" color={theme.colors.textSecondary} size={22} />
          </Pressable>
        </View>

        <View style={styles.intro}>
          <Text variant="overline" color="brand">
            {t('common.questionCount', { count: test.questionCount })} ·{' '}
            {t('common.minutesShort', { value: `${test.estMinutes[0]}-${test.estMinutes[1]}` })}
          </Text>
          <Text variant="title">{localized(test.title)}</Text>
          <Text variant="body" color="textSecondary">
            {localized(test.description)}
          </Text>
        </View>

        <Text variant="overline" color="textMuted" style={styles.sectionLabel}>
          {t('test.skillsLabel')}
        </Text>
        <View style={styles.bullets}>
          {topKinds(test.questions).map((kind) => {
            const bullet = labels.skill(kind);
            return (
              <Card key={kind}>
                <Text variant="subheading">{bullet.title}</Text>
                <Text variant="bodySmall" color="textSecondary">
                  {bullet.hint}
                </Text>
              </Card>
            );
          })}
        </View>

        <Text variant="caption" color="textMuted" style={styles.disclaimer}>
          {t('common.testDisclaimer')}
        </Text>

        <View style={styles.introAction}>
          <Button
            label={t('test.start')}
            onPress={() => {
              track('test_start', { test: test.id, questions: test.questionCount });
              setSessionSeed(`${test.id}-${Date.now()}`);
              questionStartedAt.current = Date.now();
              setPhase('running');
            }}
          />
        </View>
      </Screen>
    );
  }

  if (phase === 'result' && result !== null) {
    // Reklam, sonuç ekranından çıkışta: skorun üstünü kapatmıyor.
    return (
      <ScoreReveal
        result={result}
        testTitle={localized(test.title)}
        onDone={() => {
          void afterRound().finally(() => router.back());
        }}
      />
    );
  }

  const question = questions[questionIndex];
  if (question === undefined) {
    return <Screen />;
  }

  return (
    <Screen>
      {/* 20 soruda bölmeli çizgi okunmuyor; tek çubuk ve sayaç yeterli. */}
      <View style={styles.runnerHeader}>
        <View style={styles.runnerHeaderRow}>
          <Text variant="caption" color="textMuted">
            {t('test.questionCounter', {
              index: questionIndex + 1,
              total: questions.length,
            })}
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
          value={(questionIndex + 1) / questions.length}
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
          {question.options.map((option, index) => {
            const isSelected = selectedIndex === index;
            return (
              <Pressable
                key={option.en}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                disabled={selectedIndex !== null}
                onPress={() => answer(index)}
                style={[
                  styles.option,
                  {
                    backgroundColor: isSelected ? theme.colors.brand : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.brand : theme.colors.border,
                  },
                ]}
              >
                <Text variant="bodyStrong" color={isSelected ? 'onBrand' : 'textPrimary'}>
                  {localized(option)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bullets: {
    gap: spacing.xs,
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
    marginBottom: spacing.xl,
  },
  introAction: {
    marginTop: spacing.lg,
  },
  introHeader: {
    paddingTop: spacing.sm,
    transform: [{ rotate: '180deg' }],
    width: 22,
  },
  option: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  options: {
    gap: spacing.sm,
  },
  prompt: {
    marginBottom: spacing.xl,
  },
  questionArea: {
    flex: 1,
    justifyContent: 'center',
  },
  runnerHeader: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  runnerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
});
